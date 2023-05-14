import { z } from "zod";
import mongoose from "mongoose";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import { Profile } from "~/utils/odm";

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
    }

    if (profile.email !== ctx.session?.user.email) {
      ret.email = null;
    }

    return profile;
  }),
});
