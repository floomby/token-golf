import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { FeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Spinner from "~/components/Spinner";
import { flattenId } from "~/utils/flatten";
import Leaderboard from "~/components/Leaderboard";
import { ModalContext } from "~/providers/modal";
import ChallengeHeader from "~/components/ChallengeHeader";

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

  const { setChallengeId } = useContext(ModalContext);

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
          <ChallengeHeader
            id={flattenId(id) || ""}
            challenge={challenge}
            author={author}
          />
        ) : (
          <Spinner className="mt-24" />
        )}
        <Leaderboard challengeId={flattenId(id) || ""} />
      </main>
    </>
  );
};

export default OverviewPage;
