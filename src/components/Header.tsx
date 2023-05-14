import Link from "next/link";
import UserDisplay from "./UserDisplay";
import Image from "next/image";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useState } from "react";
import CreateChallengeModal from "./CreateChallengeModal";
// import EnvironmentIndicator from "./EnvironmentIndicator";

const Header: React.FC = () => {
  const [createChallengeModalOpen, setCreateChallengeModalOpen] =
    useState(false);

  return (
    <header className="z-10 h-20 bg-teal-100 shadow-md dark:bg-teal-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* <EnvironmentIndicator /> */}
            <Link href="/">
              <h1 className="ml-2 pr-2 text-2xl font-semibold text-stone-800">
                {/* <Image src="/logo.svg" alt="Logo" width={64} height={64} /> */}
                LLM Golf
              </h1>
            </Link>
            <button
              className={
                "rounded px-4 py-2 font-semibold" +
                colorFromFeedbackLevel(FeedbackLevel.Primary, true)
              }
              onClick={() => {
                setCreateChallengeModalOpen(true);
              }}
            >
              Create Challenge
            </button>
            <CreateChallengeModal
              shown={createChallengeModalOpen}
              setModalShown={setCreateChallengeModalOpen}
            />
            
          </div>
          <div className="flex items-center">
            <div className="ml-4 flex items-center gap-4">
              <UserDisplay />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
