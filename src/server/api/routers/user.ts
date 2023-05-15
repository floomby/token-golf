import { z } from "zod";
import mongoose from "mongoose";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import { Challenge, Profile } from "~/utils/odm";

export const userRouter = createTRPCRouter({
  read: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    await db();

    const profile = await Profile.findById(input);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const ret = {
      name: profile.name,
      image: profile.image,
      email: profile.email,
    } as {
      name: string;
      image: string;
      email: string | null;
    };

    if (profile.email !== ctx.session?.user.email) {
      ret.email = null;
    }

    return ret;
  }),

  listChallenges: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      await db();

      const challenges = await Challenge.find(
        { createdBy: new mongoose.Types.ObjectId(input) },
        { name: 1, description: 1, id: "$_id" }
      );

      return challenges;
    }),

  setDisplayName: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      if (input.length === 0) {
        throw new Error("Display name cannot be empty");
      }

      if (input.length > 50) {
        throw new Error("Display name cannot be longer than 30 characters");
      }

      await db();

      const profile = await Profile.findOneAndUpdate(
        {
          email: ctx.session.user.email,
        },
        {
          name: input,
        }
      );
    }),
});
