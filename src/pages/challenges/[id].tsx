import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import PromptInput from "~/components/PromptInput";
import { useState } from "react";
import { useRouter } from "next/router";
import TestCarousel from "~/components/TestCarousel";
import Spinner from "~/components/Spinner";
import TestRuns from "~/components/TestRuns";
import ChallengeSubmissionsModal from "~/components/ChallengeSubmissionsModal";

const flattenId = (id: string | string[] | undefined): string | undefined => {
  if (Array.isArray(id)) {
    return id[0];
  }
  return id;
};

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

  const [prompt, setPrompt] = useState("");
  const [testIndex, setTestIndex] = useState(0);
  const [trim, setTrim] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [submissionsModalShown, setSubmissionsModalShown] = useState(false);

  return (
    <>
      <Head>
        <title>Token Golf</title>
        <meta name="description" content="Token Golf Real World Problems" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        {!!challenge ? (
          <>
            <div className="text-semibold mb-4 flex min-w-[50%] flex-col gap-1">
              <h1 className="text-4xl">{challenge.name}</h1>
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
