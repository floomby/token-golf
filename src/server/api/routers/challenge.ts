import { TypeOf, z } from "zod";
import mongoose from "mongoose";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import { Challenge, Profile, Run, TestRun } from "~/utils/odm";
import { ChallengeUploadSchema } from "~/utils/schemas";
import { runTest } from "~/utils/runner";
import { countTokens, getSegments } from "~/utils/tokenize";

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

      const runs = await Run.find(
        {
          challenge: new mongoose.Types.ObjectId(input),
          profile: new mongoose.Types.ObjectId(ctx.session.user.profileId),
        },
        {
          at: 1,
          results: 1,
          tokenCount: 1,
          prompt: 1,
          trim: 1,
          caseSensitive: 1,
          // true if all results are successful
          success: {
            $reduce: {
              input: "$results",
              initialValue: true,
              in: { $and: ["$$value", "$$this.success"] },
            },
          },
        }
      );

      return runs;
    }),
  
  getLeaderboard: publicProcedure
    .input(z.object({
      challengeId: z.string(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      await db();

      // get the lowest token counts for each profile returning the run id, the profile, and the token count
      const runs = await Run.aggregate([
        {
          $match: {
            challenge: new mongoose.Types.ObjectId(input.challengeId),
            success: true,
          },
        },
        {
          $group: {
            _id: "$profile",
            tokenCount: {
              $min: "$tokenCount",
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
            tokenCount: 1,
          },
        },
        {
          $limit: input.limit,
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
              image: 1,
            },
          },
        },
      ]);

      return runs;
    }),
        
});
