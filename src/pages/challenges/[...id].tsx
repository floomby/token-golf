import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import { FeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import PromptInput from "~/components/PromptInputs";
import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import TestCarousel from "~/components/TestCarousel";
import Spinner from "~/components/Spinner";
import TestRuns from "~/components/TestRuns";
import { flattenId, getSecond } from "~/utils/flatten";
import { ModalContext } from "~/providers/modal";
import { EditorContext } from "~/providers/editor";
import ChallengeHeader from "~/components/ChallengeHeader";
import { useSession } from "next-auth/react";

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
        duration: 10000,
      });
    },
  });

  // I have mixed feeling about having the run submission be in the url like it is
  // It has some advantages, but with the editor state being in a provider it is no
  // longer needed for the original reason I did it
  const {} = api.challenge.getRun.useQuery(getSecond(id) || "", {
    enabled: !!getSecond(id),
    onError: (error) => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: error.message,
        level: FeedbackLevel.Error,
        duration: 10000,
      });
    },
    onSuccess: (data) => {
      if (data.message) {
        const id = Math.random().toString(36).substring(7);
        notifications.add(id, {
          message: data.message,
          level: FeedbackLevel.Warning,
          duration: 10000,
        });
      } else {
        setPrompts(data.prompts);
        setCaseSensitive(data.caseSensitive);
        setTrim(data.trim);
      }
    },
    refetchOnWindowFocus: false,
  });

  const { setPrompts, setTrim, setCaseSensitive } = useContext(EditorContext);

  const { data: author } = api.user.read.useQuery(
    challenge?.createdBy.toString() || "",
    {
      enabled: !!challenge?.createdBy,
      onError: (error) => {
        const id = Math.random().toString(36).substring(7);
        notifications.add(id, {
          message: error.message,
          level: FeedbackLevel.Error,
          duration: 10000,
        });
      },
    }
  );

  const { status } = useSession();

  const { data: testRuns, refetch: refetchTests } =
    api.challenge.myTestRuns.useQuery(flattenId(id) || "", {
      enabled: !!flattenId(id) && status === "authenticated",
      // refetchInterval: 1000,
    });

  const { setChallengeId } = useContext(ModalContext);

  useEffect(() => {
    setChallengeId(flattenId(id) || null);
  }, [id, setChallengeId]);

  useEffect(() => {
    setPrompts([""]);
    setTrim(true);
    setCaseSensitive(false);
  }, [setPrompts, setTrim, setCaseSensitive]);

  return (
    <>
      <Head>
        <title>
          {challenge ? `Challenge - ${challenge.name}` : "Challenge"}
        </title>
        <meta name="description" content="Completing a token golf challenge" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex w-full max-w-[calc(100vw-10px)] flex-col items-center justify-center p-4">
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
        <PromptInput
          challengeId={flattenId(id) || ""}
          refetchTests={refetchTests}
        />
        <TestRuns
          // challengeId={flattenId(id) || ""}
          tests={challenge?.tests ?? []}
          testRuns={testRuns}
        />
      </main>
    </>
  );
};

export default ChallengePage;
