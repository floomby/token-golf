import Link from "next/link";
import UserDisplay from "./UserDisplay";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useState } from "react";
import CreateChallengeModal from "./CreateChallengeModal";
import HowToModal from "./HowToModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const Header: React.FC = () => {
  const [createChallengeModalOpen, setCreateChallengeModalOpen] =
    useState(false);

  const [howToModalOpen, setHowToModalOpen] = useState(false);

  return (
    <header className="z-10 h-20 bg-teal-100 shadow-md dark:bg-teal-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <h1
                className={
                  "ml-2 pr-2 text-2xl font-semibold" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true, "light")
                }
              >
                Prompt Golf
              </h1>
            </Link>
            <button
              className={
                "rounded px-4 py-2 font-semibold" +
                colorFromFeedbackLevel(FeedbackLevel.Invisible, true, "light")
              }
              onClick={() => {
                setCreateChallengeModalOpen(true);
              }}
            >
              Create Challenge
            </button>
            <button
              className={
                "rounded px-4 py-2 font-semibold" +
                colorFromFeedbackLevel(FeedbackLevel.Invisible, true, "light")
              }
              onClick={() => {
                setHowToModalOpen(true);
              }}
            >
              How To
            </button>
            <CreateChallengeModal
              shown={createChallengeModalOpen}
              setModalShown={setCreateChallengeModalOpen}
            />
            <HowToModal
              shown={howToModalOpen}
              setModalShown={setHowToModalOpen}
            />
          </div>
          <div className="flex items-center">
            <div className="ml-4 flex items-center gap-4">
              <UserDisplay />
              <Link
                href="https://github.com/floomby/token-golf"
                className={
                  "hover:scale-105" +
                  // "flex flex-row justify-center"
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true, "light")
                }
              >
                <FontAwesomeIcon icon={faGithub} className="h-fit w-10" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
