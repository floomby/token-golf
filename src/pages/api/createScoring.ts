// A get request to this route will reindex the profile scores for a given challenge

import { type NextApiRequest, type NextApiResponse } from "next";
import db from "~/utils/db";
import { Scoring } from "~/utils/odm";
import { env } from "~/env.mjs";

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

  const { scoring } = req.query;

  if (!scoring) {
    res.status(400);
    res.end();
    return;
  }

  const scores = (scoring as string).split(",");

  await db();

  await Scoring.create([{
    scores,
  }]);

  res.status(200);
  res.end();
};
