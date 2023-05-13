import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
// import DiscordProvider from "next-auth/providers/discord";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { env } from "~/env.mjs";
import db from "~/utils/db";
import mongoose from "mongoose";
import { Profile } from "~/utils/odm";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      await db();

      const sess = await mongoose.startSession();
      sess.startTransaction();
      const abort = async () => {
        await sess.abortTransaction();
        await sess.endSession();
      };

      try {
        const profile = await Profile.findOne({ email: user.email }, null, {
          session: sess,
        });

        if (!profile) {
          await Profile.create(
            [
              {
                email: session.user.email,
                name: session.user.name,
                image: session.user.image,
              },
            ],
            { session: sess }
          );
        }

        await sess.commitTransaction();

        const ret = {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            name: profile?.name || session.user.name,
            image: profile?.image || session.user.image,
          },
        };

        return ret;
      } catch (err) {
        await abort();
        throw err;
      }
    },
  },
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(
    (async () => {
      await db();
      return mongoose.connection.getClient();
    })()
  ),
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
