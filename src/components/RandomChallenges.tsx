import { useRouter } from "next/router";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faC,
  faCheck,
  faH,
  faHeart,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import ClampText from "./ClampText";
import { Tooltip } from "react-tooltip";
import longAgo from "~/utils/longAgo";
import { useSession } from "next-auth/react";

const RandomChallenges: React.FC = () => {
  const router = useRouter();

  const notifications = useNotificationQueue();

  const { status } = useSession();

  const { data: challenges, refetch } = api.challenge.randomChallenges.useQuery(
    undefined,
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
    <div className="flex h-full w-full flex-col items-start justify-start rounded-lg bg-zinc-200 p-4 dark:bg-gray-800">
      <div className="flex w-full justify-between">
        <h1 className="text-2xl font-semibold">Random Challenges</h1>
        {!!challenges && (
          <button
            className={
              "mt-2 w-8 rounded p-2 hover:scale-110" +
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
      <div className="flex w-full flex-col items-end px-2">
        {!!challenges ? (
          <>
            <table className="w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="px-2 py-1">Title</th>
                  <th className="px-2 py-1">Completions/Attempts</th>
                  <th className="px-2 py-1"></th>{" "}
                  {/* like, completed with tooltip */}
                  <th className="px-2 py-1">Creator</th>
                  <th className="px-2 py-1">Creation Date</th>
                </tr>
              </thead>
              <tbody>
                {challenges?.map((challenge, i) => {
                  return (
                    <tr
                      key={i}
                      className="cursor-pointer bg-stone-300 bg-opacity-30 transition-all duration-200 ease-in-out hover:bg-stone-300 dark:hover:bg-stone-700"
                      onClick={() => {
                        void router.push(`/overviews/${challenge.id}`);
                      }}
                    >
                      <td className="pl-1">
                        <ClampText
                          text={`${challenge.name} - ${challenge.description}`}
                          maxLength={60}
                        />
                      </td>
                      <td className="pl-3">
                        {challenge.completionCount}/{challenge.attemptCount}
                      </td>
                      <td className="pl-1">
                        {status === "authenticated" && (
                          <>
                            <span
                              data-tooltip-id={`stats-${i}`}
                              className="flex flex-row gap-2"
                            >
                              {!!challenge.liked ? (
                                <FontAwesomeIcon
                                  icon={faHeart}
                                  className="h-4 w-4 text-pink-500"
                                />
                              ) : (
                                <span className="h-4 w-4"></span>
                              )}
                              {!!challenge.bestScore && (
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="h-4 w-4 text-green-500"
                                />
                              )}
                            </span>
                            <Tooltip id={`stats-${i}`}>
                              {`${
                                !!challenge.lastAttempted
                                  ? "Last attempted " +
                                    longAgo(challenge.lastAttempted)
                                  : "Not attempted "
                              } - ${
                                !!challenge.bestScore
                                  ? "Best score: " +
                                    challenge.bestScore.tokenCount.toString()
                                  : "Unsolved"
                              }`}
                            </Tooltip>
                          </>
                        )}
                      </td>
                      <td className="pl-1">
                        <span
                          className="transition-all duration-200 ease-in-out hover:text-blue-500"
                          onClick={(e) => {
                            void router.push(`/users/${challenge.creator.id}`);
                            e.stopPropagation();
                          }}
                        >
                          {challenge.creator.name}
                        </span>
                      </td>
                      <td className="pl-1">
                        {new Date(challenge.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : (
          <div className="flex w-full justify-center">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomChallenges;
