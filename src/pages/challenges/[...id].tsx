import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import PromptInput from "~/components/PromptInput";
import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import TestCarousel from "~/components/TestCarousel";
import Spinner from "~/components/Spinner";
import TestRuns from "~/components/TestRuns";
import Image from "next/image";
import { flattenId, getSecond } from "~/utils/flatten";
import { SubmissionModalContext } from "~/providers/submissionModal";
import { EditorContext } from "~/providers/editor";
import ChallengeHeader from "~/components/ChallengeHeader";

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

  // I have mixed feeling about having the run submission be in the url like it is
  // It has some advantages, but with the editor state being in a provider it is no
  // longer needed for the original reason I did it
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

  const { setPrompt, setTrim, setCaseSensitive } = useContext(EditorContext);

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

  const { setChallengeId } = useContext(SubmissionModalContext);

  useEffect(() => {
    setChallengeId(flattenId(id) || null);
  }, [id, setChallengeId]);

  return (
    <>
      <Head>
        <title>
          {challenge ? `Challenge - ${challenge.name}` : "Challenge"}
        </title>
        <meta name="description" content="Completing a token golf challenge" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col max-w-[calc(100vw-10px)] items-center justify-center p-4 w-full">
        {!!challenge ? (
          <>
            <ChallengeHeader
              id={flattenId(id) || ""}
              challenge={challenge}
              author={author}
              onClick={() =>
                void router.push(`/overviews/${flattenId(id) || ""}`)
              }
              showSubmissions={false}
              showPlayButton={false}
            />
            <TestCarousel challenge={challenge} />
          </>
        ) : (
          <Spinner />
        )}
        <PromptInput challengeId={flattenId(id) || ""} />
        <TestRuns challengeId={flattenId(id) || ""} tests={challenge?.tests ?? []} />
      </main>
    </>
  );
};

export default ChallengePage;
