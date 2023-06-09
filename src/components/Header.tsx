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
import { faList } from "@fortawesome/free-solid-svg-icons";
import NavModal from "./NavModal";

const Header: React.FC = () => {
  const { setHowToShown, setCreateShown, setNavShown } =
    useContext(ModalContext);

  const router = useRouter();

  return (
    <header className="z-10 h-fit w-full overflow-x-auto bg-teal-100 shadow-md dark:bg-teal-200">
      <div className="mx-0 w-full px-2 py-4 sm:px-4">
        <div className="mx-0 flex w-full items-center justify-between">
          <div className="flex w-full grow items-center gap-2 sm:gap-4">
            <Link href="/">
              <h1
                className={
                  "text-lg font-semibold sm:text-xl md:ml-2 md:pr-2 md:text-2xl" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true, "light")
                }
              >
                Prompt Golf
              </h1>
            </Link>
            <Link
              href="/leaderboard"
              className={
                "hidden rounded py-2 font-semibold md:flex md:px-4" +
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
                "hidden rounded py-2 font-semibold md:flex md:px-4" +
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
                "hidden rounded py-2 font-semibold md:flex md:px-4" +
                colorFromFeedbackLevel(FeedbackLevel.Invisible, true, "light")
              }
              onClick={() => {
                setHowToShown(true);
              }}
            >
              How To
            </button>
            <button
              className={
                "flex rounded py-2 pl-4 font-semibold md:hidden md:px-4" +
                colorFromFeedbackLevel(FeedbackLevel.Invisible, true, "light")
              }
              onClick={() => {
                setNavShown(true);
              }}
            >
              <FontAwesomeIcon icon={faList} className="h-fit w-6" />
            </button>
            <NavModal />
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
