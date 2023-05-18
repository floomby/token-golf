import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { useRef, useState } from "react";
import { useRouter } from "next/router";
import Spinner from "~/components/Spinner";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import UploadFileModal from "~/components/UploadFileModal";
import { Tooltip } from "react-tooltip";
import { flattenId } from "~/utils/flatten";
import Completed from "~/components/Completed";
import mongoose from "mongoose";

type MeUserProps = {
  name: string;
  email: string;
  image: string;
  joined: Date;
};
const MeUser: React.FC<MeUserProps> = ({ name, email, image, joined }) => {
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
      <div className="flex flex-row items-center justify-start gap-2">
        <div className="relative h-20 w-20 shrink-0 p-0">
          <button
            className={
              "absolute bottom-0 left-0 z-10 w-6 rounded-full p-1 opacity-80 hover:scale-110 hover:opacity-100" +
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
            width={32}
            height={32}
          />
        </div>
        <button
          className={
            "w-6 translate-x-[100%] translate-y-1/2 rounded-full opacity-80 hover:scale-110 hover:opacity-100" +
            colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
          }
          onClick={() => {
            setEditingName(true);
            inputRef.current?.focus();
          }}
        >
          <FontAwesomeIcon icon={faPencilAlt} className="p-1" />
        </button>
        <input
          className={
            "z-10 rounded-lg border-0 px-2 text-2xl font-semibold duration-200 ease-in-out" +
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
      <p className="ml-4 text-sm text-gray-800 dark:text-gray-400">
        Joined:{" "}
        {joined.toLocaleString(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
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
};
const OtherUser: React.FC<OtherUserProps> = ({ name, image, joined }) => {
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
            width={32}
            height={32}
          />
        </div>
        <h2 className="text-2xl font-semibold">{name}</h2>
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
    <div className="flex flex-col items-start justify-start gap-2 p-4">
      <h2 className="text-2xl">Challenges</h2>
      <div className="flex w-full flex-row items-start justify-start gap-4">
        <div className="flex basis-1/4 flex-col items-start justify-start gap-2 border-l-2 pl-2">
          {!!challenges ? (
            challenges.length > 0 ? (
              challenges.map((challenge) => (
                <span
                  key={(challenge.id as mongoose.Types.ObjectId).toString()}
                >
                  <Tooltip id={challenge.id as string} place="right">
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
      <main>
        {!!user ? (
          user.email ? (
            <MeUser
              name={user.name}
              email={user.email}
              image={user.image}
              joined={user.joined}
            />
          ) : (
            <OtherUser
              name={user.name}
              image={user.image}
              joined={user.joined}
            />
          )
        ) : (
          <Spinner />
        )}
        <div className="flex flex-row items-start justify-start gap-4">
          <UserChallenges id={flattenId(id) || ""} />
          {id && <Completed userId={flattenId(id) || ""} />}
        </div>
      </main>
    </>
  );
};

export default UserPage;
