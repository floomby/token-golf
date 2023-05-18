// FIXME: The endpoint naming is really bad (the schema names are also not amazing either)
// FIXME: This is really terrible to be disabling in a trpc router
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { TypeOf, z } from "zod";
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
import Liked from "~/components/Liked";

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
          { session }
        );

        await session.commitTransaction();

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

  getResult: publicProcedure.input(z.string()).query(async ({ input }) => {
    await db();
    const run = await Run.findById(input);

    if (!run) {
      throw new Error("Run not found");
    }

    return run;
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
      const runs = await Run.aggregate([
        {
          $match: {
            challenge: new mongoose.Types.ObjectId(input.challengeId),
            profile: { $exists: true },
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
            _id: "$profile",
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
          $limit: input.limit,
        },
        {
          $sort: {
            tokenCount: 1,
          },
        },
        {
          $lookup: {
            from: "profiles",
            localField: "_id",
            foreignField: "_id",
            as: "profile",
          },
        },
        {
          $unwind: "$profile",
        },
        {
          $project: {
            tokenCount: 1,
            at: 1,
            runId: 1,
            profile: {
              _id: 1,
              name: 1,
              // image: 1,
            },
          },
        },
      ]);

      return runs as {
        tokenCount: number;
        at: Date;
        runId: string;
        profile: { _id: string; name: string };
      }[];
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
          },
        },
      ]);

      return runs;
    }),

  randomChallenges: publicProcedure.query(async () => {
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
        $project: {
          name: 1,
          description: 1,
          id: "$_id",
          creator: {
            id: "$creator._id",
            name: "$creator.name",
            // image: "$creator.image",
          },
          createdAt: 1,
        },
      },
    ]);

    return challenges;
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
                  challenge: new mongoose.Types.ObjectId(input),
                  profile: profileId,
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
                  _id: "$profile",
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
                $limit: 1,
              },
              {
                $project: {
                  tokenCount: 1,
                  at: 1,
                  runId: 1,
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
                  challenge: new mongoose.Types.ObjectId(input),
                  // must exist and be equal to the current user's profile id
                  profile: profileId,
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
                  challenge: new mongoose.Types.ObjectId(input),
                  // must exist and be equal to the current user's profile id
                  profile: profileId,
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
        {
          $project: {
            bestScore: {
              $first: "$bestScore",
            },
            // last attempted should be the most recent of either a test run or a real run
            lastAttempted: {
              $max: ["$lastAttempted.at", "$lastTested.at"],
            },
            liked: {
              $in: [profileId, "$likes.profile"],
            },
          },
        },
      ]);

      return (stats[0] ?? undefined) as
        | {
            bestScore: {
              tokenCount: number;
              at: Date;
              runId: string;
            };
            lastAttempted: [Date] | [];
            liked: boolean;
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
