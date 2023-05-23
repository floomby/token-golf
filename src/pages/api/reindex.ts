// A get request to this route will reindex the profile scores for a given challenge

import mongoose from "mongoose";
import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { updateChallengeScores } from "~/utils/scoring";

const reindex = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "GET") {
    res.status(405);
    res.end();
    return;
  }

  const { challengeId, scoringId } = req.query;

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

  if (!challengeId || !scoringId) {
    res.status(400);
    res.end();
    return;
  }

  await updateChallengeScores(
    new mongoose.Types.ObjectId(challengeId as string),
    new mongoose.Types.ObjectId(scoringId as string)
  );

  res.status(200);
  res.end();
};

export default reindex;
