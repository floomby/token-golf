// A get request to this route will reindex the profile scores for a given challenge

import mongoose from "mongoose";
import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { reindexEverything, updateChallengeScores } from "~/utils/scoring";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "GET") {
    res.status(405);
    res.end();
    return;
  }

  if (!env.ADMIN_AUTH_TOKEN) {
    res.status(500);
    res.end();
    return;
  }

  if (req.headers.authorization !== env.ADMIN_AUTH_TOKEN) {
    res.status(401);
    res.end();
    return;
  }

  await reindexEverything();

  res.status(200);
  res.end();
};
