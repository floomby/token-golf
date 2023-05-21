// FIXME: The endpoint naming is really bad (the schema names are also not amazing either)
// FIXME: This is really terrible to be disabling in a trpc router
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { z } from "zod";
import mongoose from "mongoose";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  eitherProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import { Challenge, IRun, Profile, Run, TestRun } from "~/utils/odm";
import { ChallengeUploadSchema } from "~/utils/schemas";
import { runTest } from "~/utils/runner";
import { countTokens, getSegments } from "~/utils/tokenize";
import { inspect } from "util";
import { updateChallengeScoreIndex } from "~/utils/scoring";

export const challengeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(ChallengeUploadSchema)
    .mutation(async ({ input, ctx }) => {
      await db();

      const challenge = await Challenge.create({
        ...input,
        createdBy: new mongoose.Types.ObjectId(ctx.session.user.profileId),
      });
      return challenge;
    }),

  read: publicProcedure.input(z.string()).query(async ({ input }) => {
    await db();
    const challenge = await Challenge.findById(input);
    return challenge;
  }),

  runSingleTest: protectedProcedure
    .input(
      z.object({
        challengeId: z.string(),
        testIndex: z.number(),
        prompt: z.string(),
        trim: z.boolean(),
        caseSensitive: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.prompt === "") {
        throw new Error("Prompt cannot be empty");
      }

      await db();

      // Unneeded here tbh
      const session = await mongoose.startSession();
      session.startTransaction();
      const abort = async () => {
        await session.abortTransaction();
        await session.endSession();
      };

      try {
        const challenge = await Challenge.findById(input.challengeId, null, {
          session,
        });

        if (!challenge) {
          throw new Error("Challenge not found");
        }

        const test = challenge.tests[input.testIndex];

        if (!test) {
          throw new Error("Test not found");
        }

        const tokenCount = countTokens(getSegments(input.prompt));

        const result = await runTest(
          test,
          input.prompt,
          input.trim,
          input.caseSensitive
        );

        const testRun = await TestRun.create(
          [
            {
              prompt: input.prompt,
              trim: input.trim,
              caseSensitive: input.caseSensitive,
              tokenCount,
              challenge: challenge._id,
              testIndex: input.testIndex,
              result: result.result,
              success: result.success,
              profile: new mongoose.Types.ObjectId(ctx.session.user.profileId),
            },
          ],
          { session }
        );

        await session.commitTransaction();

        return result;
      } catch (err) {
        await abort();
        throw err;
      }
    }),

  runSingleTestAnon: publicProcedure
    .input(
      z.object({
        challengeId: z.string(),
        testIndex: z.number(),
        prompt: z.string(),
        trim: z.boolean(),
        caseSensitive: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.prompt === "") {
        throw new Error("Prompt cannot be empty");
      }

      await db();

      const challenge = await Challenge.findById(input.challengeId);

      if (!challenge) {
        throw new Error("Challenge not found");
      }

      const test = challenge.tests[input.testIndex];

      if (!test) {
        throw new Error("Test not found");
      }

      const result = await runTest(
        test,
        input.prompt,
        input.trim,
        input.caseSensitive
      );

      return result;
    }),

  myTestRuns: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      if (input === "") {
        return [];
      }

      await db();

      // aggregation to get the most recent runs with a limit of 25
      const runs = await TestRun.aggregate([
        {
          $match: {
            challenge: new mongoose.Types.ObjectId(input),
            profile: new mongoose.Types.ObjectId(ctx.session.user.profileId),
          },
        },
        {
          $sort: {
            at: -1,
          },
        },
        {
          $limit: 25,
        },
        {
          $project: {
            prompt: 1,
            trim: 1,
            caseSensitive: 1,
            tokenCount: 1,
            at: 1,
            testIndex: 1,
            result: 1,
            success: 1,
          },
        },
      ]);

      return runs;
    }),

  submit: protectedProcedure
    .input(
      z.object({
        challengeId: z.string(),
        prompt: z.string(),
        trim: z.boolean(),
        caseSensitive: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.prompt === "") {
        throw new Error("Prompt cannot be empty");
      }

      await db();

      const session = await mongoose.startSession();
      session.startTransaction();
      const abort = async () => {
        await session.abortTransaction();
        await session.endSession();
      };

      try {
        const challenge = await Challenge.findById(input.challengeId, null, {
          session,
        });

        if (!challenge) {
          throw new Error("Challenge not found");
        }

        const tokenCount = countTokens(getSegments(input.prompt));

        const result = await Promise.all(
          challenge.tests.map(async (test, index) =>
            runTest(test, input.prompt, input.trim, input.caseSensitive)
          )
        );

        const runs = await Run.create(
          [
            {
              prompt: input.prompt,
              trim: input.trim,
              caseSensitive: input.caseSensitive,
              tokenCount,
              challenge: challenge._id,
              results: result,
              profile: new mongoose.Types.ObjectId(ctx.session.user.profileId),
              success: result.every((r) => r.success),
            },
          ],
          { session, writeConcern: { w: "majority" } }
        );

        await session.commitTransaction();

        // update the index
        await updateChallengeScoreIndex(challenge._id);

        return runs[0]!;
      } catch (err) {
        await abort();
        throw err;
      }
    }),

  submitAnon: publicProcedure
    .input(
      z.object({
        challengeId: z.string(),
        prompt: z.string(),
        trim: z.boolean(),
        caseSensitive: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.prompt === "") {
        throw new Error("Prompt cannot be empty");
      }

      await db();

      const session = await mongoose.startSession();
      session.startTransaction();
      const abort = async () => {
        await session.abortTransaction();
        await session.endSession();
      };

      try {
        const challenge = await Challenge.findById(input.challengeId, null, {
          session,
        });

        if (!challenge) {
          throw new Error("Challenge not found");
        }

        const tokenCount = countTokens(getSegments(input.prompt));

        const result = await Promise.all(
          challenge.tests.map(async (test, index) =>
            runTest(test, input.prompt, input.trim, input.caseSensitive)
          )
        );

        const runs = await Run.create(
          [
            {
              prompt: input.prompt,
              trim: input.trim,
              caseSensitive: input.caseSensitive,
              tokenCount,
              challenge: challenge._id,
              results: result,
              success: result.every((r) => r.success),
            },
          ],
          { session }
        );

        await session.commitTransaction();

        return runs[0]!;
      } catch (err) {
        await abort();
        throw err;
      }
    }),

  getRun: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    await db();
    const run = await Run.findById(input);

    if (!run) {
      throw new Error("Run not found");
    }

    const ret = {
      ...run.toObject(),
      message: "",
    };

    const profileId = ctx.session?.user?.profileId;

    if (!profileId) {
      ret.prompt = "";
      ret.message = "You must be logged in to view a submission's prompt";
      return ret;
    }

    const profileBestScore: { tokenCount: number }[] = await Run.aggregate([
      {
        $match: {
          challenge: run.challenge,
          profile: new mongoose.Types.ObjectId(profileId),
          success: true,
        },
      },
      {
        $sort: {
          tokenCount: 1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          tokenCount: 1,
        },
      },
    ]);

    if (
      profileBestScore.length === 0 ||
      profileBestScore[0]!.tokenCount > ret.tokenCount
    ) {
      ret.prompt = "";
      ret.message =
        "You must have a equal or lower score to view a submission's prompt";
    }

    return ret;
  }),

  getMyResults: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      await db();

      const runs = await Run.aggregate([
        {
          $match: {
            challenge: new mongoose.Types.ObjectId(input),
            profile: new mongoose.Types.ObjectId(ctx.session.user.profileId),
          },
        },
        {
          $sort: {
            at: -1,
          },
        },
        // {
        //   $limit: 25,
        // },
        {
          $project: {
            at: 1,
            results: 1,
            tokenCount: 1,
            prompt: 1,
            trim: 1,
            caseSensitive: 1,
            success: {
              $reduce: {
                input: "$results",
                initialValue: true,
                in: { $and: ["$$value", "$$this.success"] },
              },
            },
          },
        },
      ]);

      return runs as (mongoose.Document<unknown, object, IRun> &
        Omit<
          IRun & {
            _id: mongoose.Types.ObjectId;
          },
          never
        >)[];
    }),

  getLeaderboard: publicProcedure
    .input(
      z.object({
        challengeId: z.string(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      await db();

      // get the lowest token counts for each profile returning the run id, the profile, and the token count
      const runs: {
        tokenCount: number;
        at: Date;
        runId: string;
        profile: { _id: string; name: string };
        score?: number;
      }[] = await Run.aggregate([
        {
          $match: {
            challenge: new mongoose.Types.ObjectId(input.challengeId),
            profile: { $exists: true },
            success: true,
          },
        },
        {
          $group: {
            _id: "$profile",
            runs: {
              $push: {
                tokenCount: "$tokenCount",
                at: "$at",
                runId: "$_id",
              },
            },
          },
        },
        // sort each group by token count
        {
          $project: {
            runs: {
              $sortArray: {
                input: "$runs",
                sortBy: {
                  tokenCount: 1,
                },
              },
            },
            profile: "$_id",
          },
        },
        // we only want the lowest token count for each profile
        {
          $project: {
            run: {
              $first: "$runs",
            },
            profile: 1,
          },
        },
        // we now have the lowest token counts in order, but we need to impose additional ordering by date
        {
          $group: {
            _id: "$run.tokenCount",
            runs: {
              $push: {
                tokenCount: "$run.tokenCount",
                at: "$run.at",
                runId: "$run.runId",
                profile: "$profile",
              },
            },
          },
        },
        // sort each group by date
        {
          $project: {
            run: {
              $sortArray: {
                input: "$runs",
                sortBy: {
                  at: 1,
                },
              },
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $unwind: "$run",
        },
        // left join to get the profile name
        {
          $lookup: {
            from: "profiles",
            localField: "run.profile",
            foreignField: "_id",
            as: "profile",
          },
        },
        {
          $project: {
            tokenCount: "$run.tokenCount",
            at: "$run.at",
            runId: "$run.runId",
            // profile is an array, but we want just the _id and the name from the first element
            "profile._id": {
              $arrayElemAt: ["$profile._id", 0],
            },
            "profile.name": {
              $arrayElemAt: ["$profile.name", 0],
            },
          },
        },
        {
          $project: {
            tokenCount: 1,
            at: 1,
            runId: 1,
            profile: {
              $first: "$profile",
            },
          },
        },
      ]);

      // I may want to do this join in the query (idk) It seemed bad there in my head for some reason
      // (doing this findById once seems preferable than a late stage lookup with a match even with the javascript loop)
      const scoringRuns = await Challenge.findById(input.challengeId, {
        scores: "$scores",
        id: "$_id",
      });

      if (!!scoringRuns?.scores) {
        for (const run of scoringRuns.scores) {
          for (const r of runs) {
            if (r.runId.toString() === run.run.toString()) {
              r.score = run.score;
              break;
            }
          }
        }
      }

      // console.log(inspect(runs, false, 10, true));

      return runs;
    }),

  getUserCompleted: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      await db();

      const runs = await Run.aggregate([
        {
          $match: {
            profile: new mongoose.Types.ObjectId(input),
            success: true,
          },
        },
        {
          $sort: {
            tokenCount: 1,
          },
        },
        {
          $group: {
            _id: "$challenge",
            tokenCount: {
              $first: "$tokenCount",
            },
            runId: {
              $first: "$_id",
            },
            at: {
              $first: "$at",
            },
          },
        },
        {
          $sort: {
            at: -1,
          },
        },
        {
          $lookup: {
            from: "challenges",
            localField: "_id",
            foreignField: "_id",
            as: "challenge",
          },
        },
        {
          $unwind: "$challenge",
        },
        {
          $project: {
            tokenCount: 1,
            at: 1,
            runId: 1,
            challenge: {
              id: "$challenge._id",
              name: 1,
              description: 1,
            },
            score: {
              $filter: {
                input: "$challenge.scores",
                as: "score",
                cond: {
                  $eq: ["$$score.run", "$runId"],
                },
              },
            },
          },
        },
        {
          $project: {
            tokenCount: 1,
            at: 1,
            runId: 1,
            challenge: 1,
            score: {
              $first: "$score.score",
            },
          },
        },
      ]);

      // console.log(inspect(runs, false, 10, true));

      return runs as {
        tokenCount: number;
        runId: string;
        at: Date;
        challenge: {
          id: mongoose.Types.ObjectId;
          name: string;
          description: string;
        };
        score: number;
      }[];
    }),

  randomChallenges: eitherProcedure.query(async ({ ctx }) => {
    const profileId = ctx.session?.user?.profileId
      ? new mongoose.Types.ObjectId(ctx.session.user.profileId)
      : null;

    await db();

    const challenges = await Challenge.aggregate([
      {
        $sample: {
          size: 10,
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "createdBy",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: "$creator",
      },
      {
        $lookup: {
          from: "runs",
          let: {
            challengeId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$challenge", "$$challengeId"] },
                    { $eq: ["$profile", profileId] },
                    { $eq: ["$success", true] },
                  ],
                },
              },
            },
            {
              $sort: {
                tokenCount: 1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                tokenCount: 1,
                at: 1,
                runId: "$_id",
              },
            },
          ],
          as: "bestScore",
        },
      },
      {
        $lookup: {
          from: "runs",
          let: {
            challengeId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$challenge", "$$challengeId"] },
                    { $eq: ["$profile", profileId] },
                  ],
                },
              },
            },
            {
              $sort: {
                at: -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                at: 1,
              },
            },
          ],
          as: "lastAttempted",
        },
      },
      {
        $lookup: {
          from: "testruns",
          let: {
            challengeId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$challenge", "$$challengeId"] },
                    { $eq: ["$profile", profileId] },
                  ],
                },
              },
            },
            {
              $sort: {
                at: -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                at: 1,
              },
            },
          ],
          as: "lastTested",
        },
      },
      // Completion stats count
      {
        $lookup: {
          from: "runs",
          let: {
            challengeId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$challenge", "$$challengeId"],
                },
              },
            },
            {
              $group: {
                _id: "$profile",
              },
            },
          ],
          as: "attempts",
        },
      },
      {
        $lookup: {
          from: "runs",
          let: {
            challengeId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$challenge", "$$challengeId"] },
                    { $eq: ["$success", true] },
                    { $ne: ["$profile", null] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$profile",
              },
            },
          ],
          as: "completions",
        },
      },
      {
        $lookup: {
          from: "testruns",
          let: {
            challengeId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$challenge", "$$challengeId"],
                },
              },
            },
            {
              $group: {
                _id: "$profile",
              },
            },
          ],
          as: "testAttempts",
        },
      },
      {
        $project: {
          bestScore: {
            $first: "$bestScore",
          },
          // last attempted should be the most recent of either a test run or a real run (or null if neither)
          lastAttempted: {
            $first: {
              $max: ["$lastAttempted.at", "$lastTested.at"],
            },
          },
          liked: {
            $in: [profileId, "$likes.profile"],
          },
          likes: {
            $size: "$likes",
          },
          name: 1,
          description: 1,
          id: "$_id",
          creator: {
            id: "$creator._id",
            name: "$creator.name",
            // image: "$creator.image",
          },
          createdAt: 1,
          completionCount: {
            $size: "$completions",
          },
          attemptCount: {
            // size of the set union of attempts and test attempts
            $size: {
              $setUnion: ["$attempts", "$testAttempts"],
            },
          },
        },
      },
    ]);

    // console.log(inspect(challenges, false, 10, true));

    return challenges as {
      bestScore:
        | {
            tokenCount: number;
            at: Date;
            runId: string;
          }
        | undefined;
      lastAttempted: Date | undefined;
      liked: boolean;
      likes: number;
      name: string;
      description: string;
      id: string;
      creator: {
        id: string;
        name: string;
        // image: string;
      };
      createdAt: Date;
      completionCount: number;
      attemptCount: number;
    }[];
  }),

  getChallengeStats: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      if (input === "") {
        throw new Error("Invalid challenge id");
      }

      await db();

      const profileId = new mongoose.Types.ObjectId(ctx.session.user.profileId);

      const stats = await Challenge.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(input),
          },
        },
        {
          $lookup: {
            from: "runs",
            let: {
              challengeId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$challenge", "$$challengeId"] },
                      { $eq: ["$profile", profileId] },
                      { $eq: ["$success", true] },
                    ],
                  },
                },
              },
              {
                $sort: {
                  tokenCount: 1,
                },
              },
              {
                $limit: 1,
              },
              {
                $project: {
                  tokenCount: 1,
                  at: 1,
                  // runId: "$_id",
                },
              },
            ],
            as: "bestScore",
          },
        },
        {
          $lookup: {
            from: "runs",
            let: {
              challengeId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$challenge", "$$challengeId"] },
                      { $eq: ["$profile", profileId] },
                    ],
                  },
                },
              },
              {
                $sort: {
                  at: -1,
                },
              },
              {
                $limit: 1,
              },
              {
                $project: {
                  at: 1,
                },
              },
            ],
            as: "lastAttempted",
          },
        },
        {
          $lookup: {
            from: "testruns",
            let: {
              challengeId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$challenge", "$$challengeId"] },
                      { $eq: ["$profile", profileId] },
                    ],
                  },
                },
              },
              {
                $sort: {
                  at: -1,
                },
              },
              {
                $limit: 1,
              },
              {
                $project: {
                  at: 1,
                },
              },
            ],
            as: "lastTested",
          },
        },
        // Completion stats count
        {
          $lookup: {
            from: "runs",
            let: {
              challengeId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$challenge", "$$challengeId"],
                  },
                },
              },
              {
                $group: {
                  _id: "$profile",
                },
              },
            ],
            as: "attempts",
          },
        },
        {
          $lookup: {
            from: "runs",
            let: {
              challengeId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$challenge", "$$challengeId"] },
                      { $eq: ["$success", true] },
                      { $ne: ["$profile", null] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: "$profile",
                },
              },
            ],
            as: "completions",
          },
        },
        {
          $lookup: {
            from: "testruns",
            let: {
              challengeId: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$challenge", "$$challengeId"],
                  },
                },
              },
              {
                $group: {
                  _id: "$profile",
                },
              },
            ],
            as: "testAttempts",
          },
        },
        {
          $project: {
            bestScore: {
              $first: "$bestScore",
            },
            // last attempted should be the most recent of either a test run or a real run
            lastAttempted: {
              $first: {
                $max: ["$lastAttempted.at", "$lastTested.at"],
              },
            },
            liked: {
              $in: [profileId, "$likes.profile"],
            },
            likes: {
              $size: "$likes",
            },
            completionCount: {
              $size: "$completions",
            },
            attemptCount: {
              // size of the set union of attempts and test attempts
              $size: {
                $setUnion: ["$attempts", "$testAttempts"],
              },
            },
            attempts: 1,
            completions: 1,
          },
        },
      ]);

      // console.log(inspect(stats, false, 10, true));

      return (stats[0] ?? undefined) as
        | {
            bestScore:
              | {
                  tokenCount: number;
                  at: Date;
                  _id: mongoose.Types.ObjectId;
                }
              | undefined;
            lastAttempted: Date | undefined;
            liked: boolean;
            likes: number;
            completionCount: number;
            attemptCount: number;
          }
        | undefined;
    }),

  setLike: protectedProcedure
    .input(z.object({ challengeId: z.string(), liked: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      if (input.challengeId === "") {
        throw new Error("Invalid challenge id");
      }

      await db();

      const profileId = new mongoose.Types.ObjectId(ctx.session.user.profileId);

      if (input.liked) {
        await Challenge.updateMany(
          {
            _id: input.challengeId,
            likes: {
              $not: {
                $elemMatch: {
                  profile: profileId,
                },
              },
            },
          },
          {
            $push: {
              likes: {
                profile: profileId,
              },
            },
          }
        );
      } else {
        await Challenge.findByIdAndUpdate(input.challengeId, {
          $pull: {
            likes: {
              profile: profileId,
            },
          },
        });
      }

      return input.liked;
    }),
});
