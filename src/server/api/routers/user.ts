import { z } from "zod";
import mongoose from "mongoose";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import { Challenge, Profile } from "~/utils/odm";
import { inspect } from "util";

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
      joined: profile.joined,
    } as {
      name: string;
      image: string;
      email: string | null;
      joined: Date;
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

      // rip out newlines
      input = input.replace(/[\r\n]+/g, " ");

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

  getScore: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    await db();

    const score: { score: number }[] = await Challenge.aggregate([
      {
        $unwind: "$scores",
      },
      {
        $match: {
          "scores.profile": new mongoose.Types.ObjectId(input),
        },
      },
      {
        $project: {
          score: "$scores.score",
        },
      },
      {
        // sum all scores
        $group: {
          _id: null,
          score: {
            $sum: "$score",
          },
        },
      },
    ]);

    // console.log("scores", inspect(score, false, 10, true));

    return score[0]?.score ?? 0;
  }),

  getLeaderboard: publicProcedure
    .input(
      z.object({
        limit: z.number().min(0).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      await db();

      const leaders = await Profile.aggregate([
        {
          $lookup: {
            from: "challenges",
            let: { profile: "$_id" },
            pipeline: [
              {
                $unwind: "$scores",
              },
              {
                $match: {
                  $expr: {
                    $eq: ["$scores.profile", "$$profile"],
                  },
                },
              },
              {
                $project: {
                  score: "$scores.score",
                },
              },
              {
                // sum all scores
                $group: {
                  _id: null,
                  score: {
                    $sum: "$score",
                  },
                },
              },
            ],
            as: "scored",
          },
        },
        {
          $project: {
            name: 1,
            // image: 1,
            score: {
              $arrayElemAt: ["$scored.score", 0],
            },
          },
        },
        // filter out null scores
        {
          $match: {
            score: {
              $ne: null,
            },
          },
        },
        {
          $sort: {
            score: -1,
          },
        },
        {
          $skip: input.offset,
        },
        {
          $limit: input.limit,
        },
      ]);

      return leaders as {
        _id: mongoose.Types.ObjectId;
        name: string;
        // image: string;
        score: number;
      }[];
    }),
});
