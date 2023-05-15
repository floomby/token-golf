import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import PromptInput from "~/components/PromptInput";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import TestCarousel from "~/components/TestCarousel";
import Spinner from "~/components/Spinner";
import TestRuns from "~/components/TestRuns";
import ChallengeSubmissionsModal from "~/components/ChallengeSubmissionsModal";
import Image from "next/image";
import { flattenId, getSecond } from "~/utils/flatten";

const ChallengePage: NextPage = () => {
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

  const {} = api.challenge.getResult.useQuery(getSecond(id) || "", {
    enabled: !!getSecond(id),
    onError: (error) => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: error.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
    onSuccess: (data) => {
      setPrompt(data.prompt);
      setCaseSensitive(data.caseSensitive);
      setTrim(data.trim);
    },
    refetchOnWindowFocus: false,
  });

  const [prompt, setPrompt] = useState("");
  const [testIndex, setTestIndex] = useState(0);
  const [trim, setTrim] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [submissionsModalShown, setSubmissionsModalShown] = useState(false);

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

  return (
    <>
      <Head>
        <title>{challenge ? `Challenge - ${challenge.name}` : "Challenge"}</title>
        <meta name="description" content="Completing a token golf challenge" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        {!!challenge ? (
          <>
            <div className="text-semibold mb-4 flex min-w-[50%] flex-col gap-1">
              <div className="flex flex-row items-center">
                <h1
                  className={
                    "cursor-pointer text-4xl" +
                    colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                  }
                  onClick={() =>
                    void router.push(`/overviews/${flattenId(id) || ""}`)
                  }
                >
                  {challenge.name}
                </h1>
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
              </div>
              <p>{challenge.description}</p>
            </div>
            <TestCarousel
              challenge={challenge}
              index={testIndex}
              setIndex={setTestIndex}
            />
          </>
        ) : (
          <Spinner />
        )}
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          challengeId={flattenId(id) || ""}
          testIndex={testIndex}
          trim={trim}
          setTrim={setTrim}
          caseSensitive={caseSensitive}
          setCaseSensitive={setCaseSensitive}
          showSubmissionsModal={() => setSubmissionsModalShown(true)}
        />
        <TestRuns
          challengeId={flattenId(id) || ""}
          setTestIndex={setTestIndex}
          setPrompt={setPrompt}
          setTrim={setTrim}
          setCaseSensitive={setCaseSensitive}
        />
        <div className="h-0 w-0">
          <ChallengeSubmissionsModal
            challengeId={flattenId(id) || ""}
            shown={submissionsModalShown}
            setShown={setSubmissionsModalShown}
            setPrompt={setPrompt}
            setTrim={setTrim}
            setCaseSensitive={setCaseSensitive}
            setTestIndex={setTestIndex}
          />
        </div>
      </main>
    </>
  );
};

export default ChallengePage;
