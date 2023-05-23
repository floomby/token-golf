import { useRouter } from "next/router";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faHeart, faRefresh } from "@fortawesome/free-solid-svg-icons";
import ClampText from "./ClampText";
import { Tooltip } from "react-tooltip";
import longAgo from "~/utils/longAgo";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
    <div className="flex h-full w-full flex-col items-start justify-start rounded-lg bg-zinc-200 p-2 sm:p-4 dark:bg-gray-800 gap-2 md:gap-4">
      <div className="flex w-full justify-between">
        <p className="text-lg font-semibold sm:text-xl md:text-2xl">
          Random Challenges
        </p>
        {!!challenges && (
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
      {!!challenges ? (
        <div className="flex w-full flex-row overflow-x-auto">
          <table className="grow table-auto">
            <thead className="text-left">
              <tr>
                <th className="px-2 py-1">Title</th>
                <th className="whitespace-normal px-2 py-1">
                  Completions&#x200B;/Attempts
                </th>
                <th className="px-2 py-1">Likes</th>
                <th className="px-2 py-1"></th>
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
                    // onClick={() => {
                    //   void router.push(`/overviews/${challenge.id}`);
                    // }}
                  >
                    <td>
                      <Link
                        href={`/overviews/${challenge.id}`}
                        className="flex px-1"
                      >
                        <ClampText
                          text={`${challenge.name} - ${challenge.description}`}
                          maxLength={60}
                        />
                      </Link>
                    </td>
                    <td>
                      <Link
                        href={`/overviews/${challenge.id}`}
                        className="flex whitespace-nowrap pl-3 pr-1"
                      >
                        {challenge.completionCount}/{challenge.attemptCount}
                      </Link>
                    </td>
                    <td className="pl-3">
                      <Link
                        href={`/overviews/${challenge.id}`}
                        className="flex whitespace-nowrap pl-3 pr-1"
                      >
                        {challenge.likes ?? 0}
                      </Link>
                    </td>
                    <td>
                      {status === "authenticated" && (
                        <>
                          <Link
                            href={`/overviews/${challenge.id}`}
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
                          </Link>
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
                    <td>
                      <Link
                        className="flex px-1 transition-all duration-200 ease-in-out hover:text-blue-500"
                        href={`/users/${challenge.creator.id}`}
                      >
                        {challenge.creator.name}
                      </Link>
                    </td>
                    <td>
                      <Link
                        className="flex whitespace-nowrap px-1"
                        href={`/overviews/${challenge.id}`}
                      >
                        {new Date(challenge.createdAt).toLocaleString()}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex w-full justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default RandomChallenges;
