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

type MeUserProps = {
  name: string;
  email: string;
  image: string;
};
const MeUser: React.FC<MeUserProps> = ({ name, email, image }) => {
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
              "absolute bottom-0 left-0 w-6 rounded-md p-1 opacity-80 hover:opacity-100" +
              colorFromFeedbackLevel(FeedbackLevel.Primary, true)
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
            "w-6 translate-x-[100%] translate-y-1/2 rounded-lg opacity-80 hover:opacity-100" +
            colorFromFeedbackLevel(FeedbackLevel.Primary, true)
          }
          onClick={() => {
            setEditingName(true);
            console.log(inputRef.current);
            inputRef.current?.focus();
          }}
        >
          <FontAwesomeIcon icon={faPencilAlt} className="p-1" />
        </button>
        <input
          className={
            "z-10 rounded-lg border-0 px-2 text-2xl font-semibold" +
            colorFromFeedbackLevel(FeedbackLevel.Primary, true) +
            (editingName ? " shadow-md" : " pointer-events-none")
          }
          style={{
            background: editingName ? "white" : "transparent",
            transition: "all 0.2s ease",
            color: editingName ? "black" : "white",
          }}
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
};
const OtherUser: React.FC<OtherUserProps> = ({ name, image }) => {
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
        <h2 className="text-2xl">{name}</h2>
      </div>
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
      <div className="flex flex-col items-start justify-start gap-2 border-l-2 pl-2">
        {!!challenges ? (
          challenges.length > 0 ? (
            challenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/overviews/${challenge.id}`}
                passHref
                className="hover:underline"
                data-tooltip-id={challenge.id}
              >
                <Tooltip id={challenge.id} place="right">
                  {challenge.description}
                </Tooltip>
                {challenge.name}
              </Link>
            ))
          ) : (
            <p className="text-lg">No challenges</p>
          )
        ) : (
          <Spinner />
        )}
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

  const [prompt, setPrompt] = useState("");
  const [testIndex, setTestIndex] = useState(0);

  return (
    <>
      <Head>
        <title>Token Golf</title>
        <meta name="description" content="Token Golf Real World Problems" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {!!user ? (
          user.email ? (
            <MeUser name={user.name} email={user.email} image={user.image} />
          ) : (
            <OtherUser name={user.name} image={user.image} />
          )
        ) : (
          <Spinner />
        )}
        <UserChallenges id={flattenId(id) || ""} />
      </main>
    </>
  );
};

export default UserPage;
