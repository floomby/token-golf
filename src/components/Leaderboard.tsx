import { useRouter } from "next/router";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh, faTrophy } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";
import Link from "next/link";

const Leaderboard: React.FC = () => {
  const notifications = useNotificationQueue();

  const router = useRouter();

  const { data: leaders, refetch } = api.user.getLeaderboard.useQuery(
    { limit: 45, offset: 0 },
    {
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
    <div className="flex w-full flex-col items-start justify-start rounded-lg bg-zinc-200 p-2 dark:bg-gray-800 sm:p-4">
      <div className="flex w-full justify-between">
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        {!!leaders && (
          <button
            className={
              "w-8 rounded p-1 hover:scale-105 sm:p-2" +
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
      {!!leaders ? (
        <div className="flex w-full flex-row overflow-x-auto">
          <table className="grow table-auto">
            <thead className="text-left">
              <tr>
                <th className="px-2 py-1">User</th>
                <th className="px-2 py-1">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaders?.map((leader, i) => {
                return (
                  <tr
                    key={i}
                    className="cursor-pointer bg-stone-300 bg-opacity-30 transition-all duration-200 ease-in-out hover:bg-stone-300 dark:hover:bg-stone-700"
                    data-tooltip-id={`view-${i}`}
                  >
                    <td>
                      <Link
                        className="flex h-full w-full px-1"
                        href={`/users/${leader._id.toString()}`}
                      >
                        {leader.name}
                      </Link>
                    </td>
                    <td>
                      <Link
                        className="flex h-full w-full flex-row px-1 text-green-500"
                        href={`/users/${leader._id.toString()}`}
                      >
                        <FontAwesomeIcon
                          icon={faTrophy}
                          className="mr-1 h-4 w-4 translate-y-[4.5px] text-yellow-600 dark:text-yellow-500"
                        />
                        {leader.score.toString()}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {leaders?.length === 0 && (
            <p className="pl-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
              No scores yet!
            </p>
          )}
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Leaderboard;
