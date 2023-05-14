import { z } from "zod";
import mongoose from "mongoose";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import { Challenge, Profile, TestRun } from "~/utils/odm";
import { ChallengeUploadSchema } from "~/utils/schemas";
import { runTest } from "~/utils/runner";

export const challengeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(ChallengeUploadSchema)
    .mutation(async ({ input, ctx }) => {
      await db();
      const profile = await Profile.findOne({ email: ctx.session.user.email });

      if (!profile) {
        throw new Error("Profile not found");
      }

      const challenge = await Challenge.create({
        ...input,
        createdBy: profile._id,
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
        const profile = await Profile.findOne(
          { email: ctx.session.user.email },
          null,
          { session }
        );

        if (!profile) {
          throw new Error("Profile not found");
        }

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

        const result = await runTest(test, input.prompt, input.trim, input.caseSensitive);

        const testRun = await TestRun.create(
          [
            {
              prompt: input.prompt,
              trim: input.trim,
              caseSensitive: input.caseSensitive,
              challenge: challenge._id,
              testIndex: input.testIndex,
              result: result.result,
              success: result.success,
              profile: profile._id,
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
      const profile = await Profile.findOne({ email: ctx.session.user.email });

      if (!profile) {
        throw new Error("Profile not found");
      }

      const runs = await TestRun.find(
        {
          challenge: new mongoose.Types.ObjectId(input),
          profile: profile._id,
        },
        {
          prompt: 1,
          trim: 1,
          caseSensitive: 1,
          at: 1,
          testIndex: 1,
          result: 1,
          success: 1,
        }
      );

      return runs;
    }),
});
