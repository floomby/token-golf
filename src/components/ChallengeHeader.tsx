import { faList, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { type IChallenge } from "~/utils/odm";
import Link from "next/link";
import Image from "next/image";
import { ModalContext } from "~/providers/modal";
import { useContext, useState } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useSession } from "next-auth/react";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Liked from "./Liked";
import longAgo from "~/utils/longAgo";

type ChallengeHeaderProps = {
  id: string;
  challenge: IChallenge;
  author:
    | {
        name: string;
        image: string;
      }
    | undefined;
  onClick?: () => void;
  showSubmissions?: boolean;
  showPlayButton?: boolean;
};
const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({
  id,
  challenge,
  author,
  onClick,
  showSubmissions = true,
  showPlayButton = true,
}) => {
  const router = useRouter();

  const { setSubmissionShown } = useContext(ModalContext);

  const { status } = useSession();

  const notifications = useNotificationQueue();

  const { data: stats, refetch } = api.challenge.getChallengeStats.useQuery(
    id,
    {
      enabled: status === "authenticated",
      onError: (error) => {
        const id = Math.random().toString(36).substring(7);
        notifications.add(id, {
          message: error.message,
          level: FeedbackLevel.Error,
          duration: 5000,
        });
      },
      onSuccess: (data) => {
        if (data) {
          setLiked(data.liked);
        }
      },
    }
  );

  const { mutate: like } = api.challenge.setLike.useMutation({
    onSuccess: (liked) => {
      // Obviously this is not what we want, but what do we want actually?
      setLiked(liked);
      void refetch();
    },
    onError: (error) => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: error.message,
        level: FeedbackLevel.Error,
        duration: 3000,
      });
    },
  });

  const [liked, setLiked] = useState(false);

  return (
    <div className="text-semibold mb-4 flex min-w-[50%] flex-col items-start gap-1">
      <div className="flex flex-row items-center justify-center">
        {onClick ? (
          <h1
            className={
              "cursor-pointer text-4xl" +
              colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
            }
            onClick={onClick}
          >
            {challenge.name}
          </h1>
        ) : (
          <h1 className="text-xl sm:text-2xl md:text-4xl">{challenge.name}</h1>
        )}
        {!!author ? (
          <>
            <span className="ml-2 mr-2 text-xs text-gray-500 dark:text-gray-400 sm:ml-4 md:text-sm">
              by
            </span>
            <Link
              href={`/users/${challenge.createdBy.toString()}`}
              className={
                "flex flex-row items-center gap-2 hover:scale-105" +
                colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
              }
            >
              <div className="relative h-8 w-8 shrink-0 p-0">
                <div className="absolute left-0 top-0 h-full w-full rounded-full shadow-inner shadow-gray-600 dark:shadow-gray-800"></div>
                <Image
                  referrerPolicy="no-referrer"
                  className="h-full w-full rounded-full"
                  src={author.image}
                  alt="Profile picture"
                  width={32}
                  height={32}
                />
              </div>
              <span className="text-md hidden font-semibold text-black dark:text-white sm:text-lg md:flex">
                {author.name}
              </span>
            </Link>
          </>
        ) : null}
        <div className="flex flex-col items-center md:flex-row">
          <Liked
            liked={liked}
            likes={stats?.likes ?? 0}
            onClick={() => {
              if (status === "authenticated") {
                void like({ challengeId: id, liked: !liked });
                setLiked(!liked);
              } else {
                const id = Math.random().toString(36).substring(7);
                notifications.add(id, {
                  message: "You need to be logged in to like challenges",
                  level: FeedbackLevel.Warning,
                  duration: 3000,
                });
              }
            }}
            uid="challenge-header-liked"
          />
          {status === "authenticated" && showSubmissions && (
            <button
              className={
                "px-4 py-2 font-semibold hover:scale-105" +
                colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
              }
              onClick={() => setSubmissionShown(true)}
            >
              <FontAwesomeIcon
                icon={faList}
                className="h-8 w-8 translate-x-3"
              />
            </button>
          )}
        </div>
        {showPlayButton && (
          <button
            className={
              "ml-4 whitespace-nowrap rounded-full px-2 font-semibold hover:scale-105" +
              colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
            }
            onClick={() => void router.push(`/challenges/${id}`)}
          >
            <span className="select-none">PLAY</span>
            <FontAwesomeIcon
              icon={faPlay}
              className="mr-2 h-8 w-6 translate-x-2"
            />
          </button>
        )}
      </div>
      <p>{challenge.description}</p>
      <div className="md:text-md ml-8 grid grid-cols-1 items-center gap-x-4 text-xs sm:text-sm md:grid-cols-2">
        {showSubmissions && !!stats && (
          <>
            <span>Completed by: {stats.completionCount}</span>
            <span>Attempted by: {stats.attemptCount}</span>
          </>
        )}
        {status === "authenticated" && showSubmissions && !!stats && (
          <>
            {!!stats.lastAttempted ? (
              <span>Your last attempt: {longAgo(stats.lastAttempted)}</span>
            ) : (
              <span>Not attempted</span>
            )}
            {!!stats.lastAttempted &&
              (!!stats.bestScore ? (
                <span
                  className={
                    "cursor-pointer select-none whitespace-nowrap hover:scale-105" +
                    colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                  }
                  onClick={() =>
                    void router.push(
                      `/challenges/${id}/${
                        stats.bestScore?._id.toString() ?? ""
                      }`
                    )
                  }
                >
                  Best score: {stats.bestScore.tokenCount}
                </span>
              ) : (
                <span>Unsolved</span>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ChallengeHeader;
