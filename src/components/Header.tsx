import Link from "next/link";
import UserDisplay from "./UserDisplay";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useContext } from "react";
import CreateChallengeModal from "./CreateChallengeModal";
import HowToModal from "./HowToModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { ModalContext } from "~/providers/modal";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const { setHowToShown, setCreateShown } = useContext(ModalContext);

  const router = useRouter();

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
            <Link
              href="/leaderboard"
              className={
                "rounded px-4 py-2 font-semibold" +
                colorFromFeedbackLevel(
                  FeedbackLevel.Invisible,
                  router.pathname !== "/leaderboard",
                  "light"
                ) +
                (router.pathname === "/leaderboard" ? " opacity-50" : "")
              }
            >
              Leaderboard
            </Link>
            <button
              className={
                "rounded px-4 py-2 font-semibold" +
                colorFromFeedbackLevel(FeedbackLevel.Invisible, true, "light")
              }
              onClick={() => {
                setCreateShown(true);
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
                setHowToShown(true);
              }}
            >
              How To
            </button>
            <CreateChallengeModal />
            <HowToModal />
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
