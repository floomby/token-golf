import { z } from "zod";
import mongoose from "mongoose";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import { Challenge, Profile } from "~/utils/odm";
import { ChallengeUploadSchema } from "~/utils/schemas";
import { runTest } from "~/utils/runner";

export const challengeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(ChallengeUploadSchema)
    .mutation(async ({ input }) => {
      await db();
      const challenge = await Challenge.create(input);
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
        const profile = Profile.findOne(
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

        const result = runTest(test, input.prompt);

        await session.commitTransaction();

        return result;
      } catch (err) {
        await abort();
        throw err;
      }
    }),
});
