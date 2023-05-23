import { useRouter } from "next/router";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh, faTrophy } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";
import Link from "next/link";

type ChallengeLeaderboardProps = {
  challengeId: string;
};
const ChallengeLeaderboard: React.FC<ChallengeLeaderboardProps> = ({
  challengeId,
}) => {
  const notifications = useNotificationQueue();

  const { data: runs, refetch } =
    api.challenge.getChallengeLeaderboard.useQuery(
      { challengeId, limit: 10 },
      {
        enabled: !!challengeId,
        onError: (error) => {
          const id = Math.random().toString(36).substring(7);
          notifications.add(id, {
            message: "Error loading challenge: " + error.message,
            level: FeedbackLevel.Error,
            duration: 5000,
          });
        },
        refetchOnWindowFocus: false,
      }
    );

  return (
    <div className="flex w-full flex-col items-start justify-start rounded-lg bg-zinc-200 p-2 dark:bg-gray-800">
      <div className="flex w-full justify-between">
        <p className="text-lg font-semibold sm:text-xl md:text-2xl">
          Leaderboard
        </p>
        {!!runs && (
          <button
            className={
              "w-6 rounded p-1 hover:scale-105 sm:w-8 sm:p-2" +
              colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
            }
            onClick={() => {
              void refetch();
            }}
          >
            <FontAwesomeIcon icon={faRefresh} />
          </button>
        )}
      </div>
      {!!runs ? (
        <div className="flex w-full flex-col">
          <div className="flex w-full flex-row overflow-x-auto">
            <table className="grow table-auto">
              <thead className="text-left">
                <tr>
                  <th className="px-2 py-1">Tokens</th>
                  <th className="px-2 py-1">Points</th>
                  <th className="px-2 py-1">User</th>
                  <th className="px-2 py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {runs?.map((run, i) => {
                  return (
                    <tr
                      key={i}
                      className="cursor-pointer bg-stone-300 bg-opacity-30 transition-all duration-200 ease-in-out hover:bg-stone-300 dark:hover:bg-stone-700"
                      data-tooltip-id={`view-${i}`}
                    >
                      <td>
                        <Link
                          href={`/challenges/${challengeId}/${run.runId}`}
                          className="flex px-1"
                        >
                          {run.tokenCount}
                        </Link>
                      </td>
                      <td>
                        {!!run.score ? (
                          <Link
                            className="flex flex-row px-2 text-green-500"
                            href={`/challenges/${challengeId}/${run.runId}`}
                          >
                            <FontAwesomeIcon
                              icon={faTrophy}
                              className="mr-1 h-4 w-4 translate-y-[4.5px] text-yellow-600 dark:text-yellow-500"
                            />
                            {run.score.toString()}
                          </Link>
                        ) : (
                          <Link
                            href={`/challenges/${challengeId}/${run.runId}`}
                            className="flex px-2 text-gray-500 dark:text-gray-400"
                          >
                            {"-"}
                          </Link>
                        )}
                      </td>
                      <td>
                        <Link
                          className="flex whitespace-nowrap pl-1 transition-all duration-200 ease-in-out hover:text-blue-500"
                          href={`/users/${run.profile._id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {run.profile.name}
                        </Link>
                        <Tooltip className="tooltip-overrides" id={`view-${i}`}>View this submission</Tooltip>
                      </td>
                      <td>
                        <Link
                          href={`/challenges/${challengeId}/${run.runId}`}
                          className="whitespace-nowrap pl-2 pr-1"
                        >
                          {run.at.toLocaleString()}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {runs?.length === 0 && (
            <p className="pl-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
              No submissions yet! (Be the first)
            </p>
          )}
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default ChallengeLeaderboard;
