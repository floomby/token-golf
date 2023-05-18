import { faList, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { IChallenge } from "~/utils/odm";
import Link from "next/link";
import Image from "next/image";
import { SubmissionModalContext } from "~/providers/submissionModal";
import { useContext, useState } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useSession } from "next-auth/react";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Liked from "./Liked";

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

  const { setShown: setSubmissionModalShown } = useContext(
    SubmissionModalContext
  );

  const { status } = useSession();

  const notifications = useNotificationQueue();

  const { data: stats } = api.challenge.getChallengeStats.useQuery(id, {
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
  });

  const { mutate: like } = api.challenge.setLike.useMutation({
    onSuccess: (liked) => {
      // setLiked(liked);
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
    <div className="text-semibold mb-4 flex min-w-[50%] flex-col gap-1">
      <div className="flex flex-row items-center">
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
          <h1 className="text-4xl">{challenge.name}</h1>
        )}
        {!!author ? (
          <>
            <span className="ml-4 mr-2 text-gray-500 dark:text-gray-400">
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
              <span className="text-lg font-semibold text-black dark:text-white">
                {author.name}
              </span>
            </Link>
          </>
        ) : null}
        {status === "authenticated" && (
          <Liked
            liked={liked}
            onClick={() => {
              void like({ challengeId: id, liked: !liked });
              setLiked(!liked);
            }}
          />
        )}
        {status === "authenticated" && showSubmissions && (
          <button
            className={
              "px-4 py-2 font-semibold hover:scale-105" +
              colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
            }
            onClick={() => setSubmissionModalShown(true)}
          >
            <FontAwesomeIcon
              icon={faList}
              className="mr-2 h-8 w-6 translate-x-2"
            />
          </button>
        )}
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
    </div>
  );
};

export default ChallengeHeader;
