import { type NextPage } from "next";
import Head from "next/head";

import RandomChallenges from "~/components/RandomChallenges";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Token Golf</title>
        <meta name="description" content="Token Golf Real World Problems" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <RandomChallenges />
      </main>
    </>
  );
};

export default Home;
