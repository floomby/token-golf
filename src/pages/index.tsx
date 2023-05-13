import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import PromptInput from "~/components/PromptInput";
import { useState } from "react";

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const notifications = useNotificationQueue();

  const [prompt, setPrompt] = useState("");

  return (
    <>
      <Head>
        <title>Token Golf</title>
        <meta name="description" content="Token Golf Real World Problems" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Token Golf</h2>
        {/* <button
          className={
            "rounded-lg px-4 py-2" +
            colorFromFeedbackLevel(FeedbackLevel.Primary, true)
          }
          onClick={() => {
            const id = Math.random().toString(36).substring(7);
            notifications.add(id, {
              message: "test",
              level: FeedbackLevel.Success,
              duration: 5000,
            });
          }}
        >
          Test Notification
        </button> */}

        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={() => {}}
        />
      </main>
    </>
  );
};

export default Home;
