import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { useRef, useState } from "react";
import { useRouter } from "next/router";
import Spinner from "~/components/Spinner";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faPencilAlt,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import UploadFileModal from "~/components/UploadFileModal";
import { Tooltip } from "react-tooltip";
import { flattenId } from "~/utils/flatten";
import Completed from "~/components/Completed";
import mongoose from "mongoose";

type ScoreBadgeProps = {
  profileId: string;
};
const ScoreBadge: React.FC<ScoreBadgeProps> = ({ profileId }) => {
  const notifications = useNotificationQueue();

  const { data } = api.user.getScore.useQuery(profileId, {
    enabled: !!profileId,
    onError: (error) => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: error.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
  });

  return !!data ? (
    <span className="ml-2 flex flex-row text-green-500">
      <FontAwesomeIcon
        icon={faTrophy}
        className="mr-1 h-4 w-4 translate-y-[4.5px] text-yellow-600 dark:text-yellow-500"
      />
      {data.toString()}
    </span>
  ) : null;
};

type MeUserProps = {
  name: string;
  email: string;
  image: string;
  joined: Date;
  profileId: string;
};
const MeUser: React.FC<MeUserProps> = ({
  name,
  email,
  image,
  joined,
  profileId,
}) => {
  const [showAvatarUploader, setShowAvatarUploader] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);

  const inputRef = useRef<HTMLInputElement>(null);

  const notifications = useNotificationQueue();

  const { mutate: setDisplayName } = api.user.setDisplayName.useMutation({
    onSuccess: () => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: "Display name updated",
        level: FeedbackLevel.Success,
        duration: 5000,
      });
    },
    onError: (error) => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: error.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
  });

  return (
    <div className="flex min-w-[50%] flex-col items-start justify-start gap-2 p-4">
      <div className="flex max-w-full flex-col items-start justify-start gap-2 gap-x-4 sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 shrink-0 p-0">
          <button
            className={
              "absolute bottom-0 left-0 z-10 w-6 -translate-x-1 rounded-full p-1 opacity-80 hover:scale-110 hover:opacity-100" +
              colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
            }
            onClick={() => {
              setShowAvatarUploader(true);
            }}
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>
          <div className="absolute left-0 top-0 h-full w-full rounded-full shadow-inner shadow-gray-600 dark:shadow-gray-800"></div>
          <Image
            referrerPolicy="no-referrer"
            className="h-full w-full rounded-full"
            src={image}
            alt="Profile picture"
            width={80}
            height={80}
          />
        </div>
        <div className="flex shrink-0 flex-row items-start justify-start gap-1">
          <button
            className={
              "w-0 -translate-x-1 translate-y-1/2 rounded-full opacity-80 hover:scale-110 hover:opacity-100" +
              colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
            }
            onClick={() => {
              setEditingName(true);
              inputRef.current?.focus();
            }}
          >
            <FontAwesomeIcon icon={faPencilAlt} className="w-6 p-1" />
          </button>
          <input
            className={
              "z-10 mr-2 rounded-lg border-0 px-2 text-2xl font-semibold duration-200 ease-in-out" +
              (editingName
                ? " bg-white text-black shadow-md"
                : " pointer-events-none bg-transparent text-black dark:text-white")
            }
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            disabled={!editingName}
            ref={inputRef}
            onBlur={() => {
              setEditingName(false);
              void setDisplayName(nameValue);
            }}
            placeholder="Display Name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditingName(false);
                void setDisplayName(nameValue);
              }
            }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-start gap-2">
        <p className="ml-4 mt-1 text-sm text-gray-800 dark:text-gray-400">
          Joined:{" "}
          {joined.toLocaleString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <ScoreBadge profileId={profileId} />
      </div>
      <p className="text-lg">{email}</p>
      <div className="h-0 w-0 overflow-hidden">
        <UploadFileModal
          shown={showAvatarUploader}
          hide={() => setShowAvatarUploader(false)}
          endpoint={`/api/uploads/image`}
          validator={(filename: string) => {
            // If you need to enforce a file type, uncomment this
            // const extension = filename.split(".").pop();
            // if (
            //   extension === "png" ||
            //   extension === "jpg" ||
            //   extension === "jpeg"
            // )
            //   return null;
            // return "Only PNG, JPG and JPEG files are allowed!";
            return null;
          }}
        />
      </div>
    </div>
  );
};

type OtherUserProps = {
  name: string;
  image: string;
  joined: Date;
  profileId: string;
};
const OtherUser: React.FC<OtherUserProps> = ({
  name,
  image,
  joined,
  profileId,
}) => {
  return (
    <div className="flex min-w-[50%] flex-col items-start justify-start gap-2 p-4">
      <div className="flex flex-row items-center justify-start gap-2">
        <div className="relative h-20 w-20 shrink-0 p-0">
          <div className="absolute left-0 top-0 h-full w-full rounded-full shadow-inner shadow-gray-600 dark:shadow-gray-800"></div>
          <Image
            referrerPolicy="no-referrer"
            className="h-full w-full rounded-full"
            src={image}
            alt="Profile picture"
            width={80}
            height={80}
          />
        </div>
        <h2 className="text-2xl font-semibold">{name}</h2>
        <ScoreBadge profileId={profileId} />
      </div>
      <p className="ml-4 text-sm text-gray-800 dark:text-gray-400">
        Joined:{" "}
        {joined.toLocaleString(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
};

type UserChallengesProps = {
  id: string;
};
const UserChallenges: React.FC<UserChallengesProps> = ({ id }) => {
  const { data: challenges } = api.user.listChallenges.useQuery(id, {
    enabled: !!id,
  });

  return (
    <div className="flex grow flex-col items-start justify-start gap-2">
      <h2 className="text-2xl">Challenges</h2>
      <div className="flex w-full flex-row items-start justify-start gap-4">
        <div className="flex flex-col items-start justify-start gap-2 border-l-2 pl-2">
          {!!challenges ? (
            challenges.length > 0 ? (
              challenges.map((challenge) => (
                <span
                  key={(challenge.id as mongoose.Types.ObjectId).toString()}
                >
                  <Tooltip
                    className="tooltip-overrides"
                    id={challenge.id as string}
                    place="right"
                  >
                    {challenge.description}
                  </Tooltip>
                  <Link
                    href={`/overviews/${(
                      challenge.id as mongoose.Types.ObjectId
                    ).toString()}`}
                    passHref
                    className={colorFromFeedbackLevel(
                      FeedbackLevel.Invisible,
                      true
                    )}
                    data-tooltip-id={(
                      challenge.id as mongoose.Types.ObjectId
                    ).toString()}
                  >
                    {challenge.name}
                  </Link>
                </span>
              ))
            ) : (
              <p className="text-lg">No challenges</p>
            )
          ) : (
            <Spinner />
          )}
        </div>
      </div>
    </div>
  );
};

const UserPage: NextPage = () => {
  const router = useRouter();

  const { id } = router.query;

  const notifications = useNotificationQueue();

  const { data: user } = api.user.read.useQuery(flattenId(id) || "", {
    enabled: !!id,
    onError: (error) => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: error.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
  });

  return (
    <>
      <Head>
        <title>{user ? `User - ${user.name}` : "User"}</title>
        <meta name="description" content="Token golf user profile page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full">
        {!!user ? (
          user.email ? (
            <MeUser
              name={user.name}
              email={user.email}
              image={user.image}
              joined={user.joined}
              profileId={flattenId(id) || ""}
            />
          ) : (
            <OtherUser
              name={user.name}
              image={user.image}
              joined={user.joined}
              profileId={flattenId(id) || ""}
            />
          )
        ) : (
          <Spinner />
        )}
        <div className="flex flex-col items-start justify-start gap-4 p-2 md:p-4 lg:flex-row">
          <UserChallenges id={flattenId(id) || ""} />
          {id && <Completed userId={flattenId(id) || ""} />}
        </div>
      </main>
    </>
  );
};

export default UserPage;
