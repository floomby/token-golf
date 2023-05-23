import { type NextPage } from "next";
import Head from "next/head";

import RandomChallenges from "~/components/RandomChallenges";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Token Golf - Home</title>
        <meta name="description" content="Token golf problem feed" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-2 sm:p-4">
        <RandomChallenges />
      </main>
    </>
  );
};

export default Home;
