/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useRouter } from "next/router";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";

type LeaderboardProps = {
  challengeId: string;
};
const Leaderboard: React.FC<LeaderboardProps> = ({ challengeId }) => {
  const router = useRouter();

  const notifications = useNotificationQueue();

  const { data: runs, refetch } = api.challenge.getLeaderboard.useQuery(
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
    <div className="flex w-full flex-col items-start justify-start rounded-lg bg-zinc-200 p-4 dark:bg-gray-800">
      <div className="flex w-full justify-between">
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        {!!runs && (
          <button
            className={
              "w-8 rounded p-2 hover:scale-105" +
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
        <table className="w-full">
          <thead className="text-left">
            <tr>
              <th className="px-2 py-1">Tokens</th>
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
                  onClick={() => {
                    void router.push(`/challenges/${challengeId}/${run.runId}`);
                  }}
                  data-tooltip-id={`view-${i}`}
                >
                  <td className="pl-1">{run.tokenCount}</td>
                  <td className="pl-1">
                    <span
                      className="transition-all duration-200 ease-in-out hover:text-blue-500"
                      onClick={(e) => {
                        void router.push(`/users/${run.profile._id}`);
                        e.stopPropagation();
                      }}
                    >
                      {run.profile.name}
                    </span>
                  </td>
                  <td className="pl-1">
                    {new Date(run.at as string).toLocaleString()}
                  </td>
                  <Tooltip id={`view-${i}`}>View this submission</Tooltip>
                </tr>
              );
            })}
            {runs?.length === 0 && (
              <p className="pl-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                No submissions yet! (Be the first)
              </p>
            )}
          </tbody>
        </table>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Leaderboard;
