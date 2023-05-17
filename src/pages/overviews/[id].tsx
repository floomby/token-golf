import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import PromptInput from "~/components/PromptInput";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import TestCarousel from "~/components/TestCarousel";
import Spinner from "~/components/Spinner";
import TestRuns from "~/components/TestRuns";
import ChallengeSubmissionsModal from "~/components/ChallengeSubmissionsModal";
import Image from "next/image";
import { flattenId } from "~/utils/flatten";
import Leaderboard from "~/components/Leaderboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { SubmissionModalContext } from "~/providers/submissionModal";

const OverviewPage: NextPage = () => {
  const router = useRouter();

  const { id } = router.query;

  const notifications = useNotificationQueue();

  const { data: challenge } = api.challenge.read.useQuery(flattenId(id) || "", {
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

  const { data: author } = api.user.read.useQuery(
    challenge?.createdBy.toString() || "",
    {
      enabled: !!challenge?.createdBy,
      onError: (error) => {
        const id = Math.random().toString(36).substring(7);
        notifications.add(id, {
          message: error.message,
          level: FeedbackLevel.Error,
          duration: 5000,
        });
      },
    }
  );

  const { status } = useSession();

  const { setChallengeId, setShown: setSubmissionModalShown } = useContext(SubmissionModalContext);

  useEffect(() => {
    setChallengeId(flattenId(id) || null);
  }, [id, setChallengeId]);

  return (
    <>
      <Head>
        <title>{challenge ? `Overview - ${challenge.name}` : "Overview"}</title>
        <meta name="description" content="Overview of a token golf challenge" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-start p-4">
        {!!challenge ? (
          <>
            <div className="text-semibold mb-4 flex min-w-[50%] flex-col gap-1">
              <div className="flex flex-row items-center">
                <h1 className="text-4xl">{challenge.name}</h1>
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
                  <button
                    className={
                      "ml-8 whitespace-nowrap px-4 py-2 font-semibold" +
                      colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                    }
                    onClick={() => setSubmissionModalShown(true)}
                  >
                    View My Submissions
                  </button>
                )}
                <button
                  className={
                    "ml-4 whitespace-nowrap rounded-full px-2 font-semibold hover:scale-105" +
                    colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                  }
                  onClick={() =>
                    void router.push(`/challenges/${id as string}`)
                  }
                >
                  <span>PLAY</span>
                  <FontAwesomeIcon
                    icon={faPlay}
                    className="mr-2 h-8 w-6 translate-x-2"
                  />
                </button>
              </div>
              <p>{challenge.description}</p>
            </div>
          </>
        ) : (
          <Spinner className="mt-24" />
        )}
        <Leaderboard challengeId={flattenId(id) || ""} />
        <div className="h-0 w-0">
          <ChallengeSubmissionsModal
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            setPrompt={() => {}}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            setTrim={() => {}}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            setCaseSensitive={() => {}}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            setTestIndex={() => {}}
          />
        </div>
      </main>
    </>
  );
};

export default OverviewPage;
