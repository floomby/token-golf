/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useRouter } from "next/router";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

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
    <div className="flex w-full flex-col items-end">
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
                  className="cursor-pointer bg-stone-300 bg-opacity-30 hover:bg-stone-200"
                  onClick={() => {
                    void router.push(`/challenges/${challengeId}/${run.runId}`);
                  }}
                >
                  <td className="pl-1">{run.tokenCount}</td>
                  <td className="pl-1">{run.profile.name}</td>
                  <td className="pl-1">
                    {new Date(run.at as string).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Leaderboard;
