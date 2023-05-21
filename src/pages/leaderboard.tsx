import { type NextPage } from "next";
import Head from "next/head";
import Leaderboard from "~/components/Leaderboard";

const LeaderboardPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Leaderboard</title>
        <meta name="description" content="Global Leaderboard for Token Golf" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-start p-4">
        <Leaderboard />
      </main>
    </>
  );
};

export default LeaderboardPage;
