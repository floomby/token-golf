// Updating a manually managed index for scoring users

import mongoose from "mongoose";
import { Challenge, IScore, Profile, Run, Scoring } from "./odm";
import db from "./db";
import { inspect } from "util";

const updateChallengeScores = async (
  challengeId: mongoose.Types.ObjectId,
  scoringId: mongoose.Types.ObjectId,
  retryAttempts = 3
) => {
  await db(); // we should already have a connection to the db established

  try {
    // INVESTIGATE This is surely not a very optimal query (idk if the optimizer just makes it fine or not)
    const out: { scores: IScore[] }[] = await Challenge.aggregate([
      {
        $match: {
          _id: challengeId,
        },
      },
      {
        $lookup: {
          from: "runs",
          localField: "_id",
          foreignField: "challenge",
          as: "scored",
          pipeline: [
            {
              $match: {
                success: true,
                profile: {
                  $exists: true,
                },
              },
            },
            {
              $group: {
                _id: "$profile",
                runs: {
                  $push: {
                    tokenCount: "$tokenCount",
                    at: "$at",
                    runId: "$_id",
                  },
                },
              },
            },
            // sort each group by token count
            {
              $project: {
                runs: {
                  $sortArray: {
                    input: "$runs",
                    sortBy: {
                      tokenCount: 1,
                    },
                  },
                },
                profile: "$_id",
              },
            },
            // we only want the lowest token count for each profile
            {
              $project: {
                run: {
                  $first: "$runs",
                },
                profile: 1,
              },
            },
            // we now have the lowest token counts in order, but we need to impose additional ordering by date
            {
              $group: {
                _id: "$run.tokenCount",
                runs: {
                  $push: {
                    tokenCount: "$run.tokenCount",
                    at: "$run.at",
                    runId: "$run.runId",
                    profile: "$profile",
                  },
                },
              },
            },
            // sort each group by date
            {
              $project: {
                run: {
                  $sortArray: {
                    input: "$runs",
                    sortBy: {
                      at: 1,
                    },
                  },
                },
              },
            },
            {
              $sort: {
                _id: 1,
              },
            },
            {
              $unwind: "$run",
            },
            {
              $group: {
                _id: null,
                runs: {
                  $push: "$run",
                },
              },
            },
            // lookup the scoring document and then zip it with the profiles
            {
              $lookup: {
                from: "scorings",
                pipeline: [
                  {
                    $match: {
                      _id: scoringId,
                    },
                  },
                ],
                as: "scoring",
              },
            },
            {
              $project: {
                profiles: "$runs.profile",
                runs: "$runs.runId",
                scores: {
                  $first: "$scoring.scores",
                },
              },
            },
            {
              $project: {
                // zip the scoring document with the runs
                zipped: {
                  $zip: {
                    inputs: ["$profiles", "$runs", "$scores"],
                  },
                },
              },
            },
            {
              $unwind: "$zipped",
            },
            {
              $project: {
                profile: {
                  $arrayElemAt: ["$zipped", 0],
                },
                run: {
                  $arrayElemAt: ["$zipped", 1],
                },
                score: {
                  $arrayElemAt: ["$zipped", 2],
                },
              },
            },
            {
              $group: {
                _id: null,
                scores: {
                  $push: {
                    profile: "$profile",
                    run: "$run",
                    score: "$score",
                  },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          scores: {
            $first: "$scored.scores",
          },
        },
      },
    ]);

    // console.log(inspect(out, false, 10, true));

    if (out.length === 0) {
      retryAttempts = 0;
      throw new Error("Failed to computed scores for challenge");
    }

    // update the challenge with the new scores
    await Challenge.findByIdAndUpdate(
      challengeId,
      {
        scores: out[0]!.scores,
      },
      {
        writeConcern: { w: "majority" },
      }
    );
  } catch (e) {
    console.log("Error updating challenge score", e);
    if (retryAttempts > 0) {
      console.log("Retrying...");
      await updateChallengeScores(challengeId, scoringId, retryAttempts - 1);
    }
  }
};

const updateChallengeScoreIndex = async (
  challengeId: mongoose.Types.ObjectId
) => {
  // await db();

  // get the first scoring document
  const scoring = await Scoring.findOne({});

  await updateChallengeScores(challengeId, scoring!._id);
};

const reindexEverything = async () => {
  await db();

  const challenges = await Challenge.find({});
  const scoring = await Scoring.findOne({});

  for (const challenge of challenges) {
    await updateChallengeScores(challenge._id, scoring!._id);
  }
};

export { updateChallengeScores, updateChallengeScoreIndex, reindexEverything };
