import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { ModalContext } from "~/providers/modal";

const NavModal: React.FC = () => {
  const { navShown, setNavShown, setCreateShown, setHowToShown } =
    useContext(ModalContext);
  const router = useRouter();

  return (
    <AnimatePresence>
      {navShown && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-50 px-4"
        >
          <div className="flex min-w-[50%] flex-col items-center justify-between rounded-lg bg-slate-200 py-4 shadow-lg dark:bg-slate-900">
            <div className="flex max-h-[80vh] w-full flex-col items-start justify-between gap-4 overflow-y-auto px-2">
              <button
                className={
                  "font-semibold md:flex md:px-4" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                }
                onClick={() => {
                  setNavShown(false);
                  setCreateShown(true);
                }}
              >
                Create Challenge
              </button>
              <button
                className={
                  "font-semibold md:flex md:px-4" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                }
                onClick={() => {
                  setNavShown(false);
                  setHowToShown(true);
                }}
              >
                How To
              </button>
              {router.pathname !== "/leaderboard" && (
                <Link
                  href="/leaderboard"
                  className={
                    "font-semibold md:flex md:px-4" +
                    colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                  }
                >
                  Leaderboard
                </Link>
              )}
              <button
                onClick={() => setNavShown(false)}
                className={
                  "font-semibold md:flex md:px-4" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                }
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavModal;
