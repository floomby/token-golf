import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { colorFromFeedbackLevel, FeedbackLevel } from "../lib/feedback";
import { Debouncer } from "~/lib/debouncers";
import { type ChallengeUpload, ChallengeUploadSchema } from "~/utils/schemas";
import { api } from "~/utils/api";
import { useNotificationQueue } from "~/providers/notifications";
import { useSession } from "next-auth/react";
import { Tooltip } from "react-tooltip";
import { ModalContext } from "~/providers/modal";

const CreateChallengeModal: React.FC = () => {
  const [challenge, setChallenge] = useState<string>("");
  const [valid, setValid] = useState<boolean>(false);
  const [parsed, setParsed] = useState<ChallengeUpload | null>(null);

  const [debouncer] = useState(new Debouncer(100));

  const notifications = useNotificationQueue();

  const { mutate: create } = api.challenge.create.useMutation({
    onSuccess: () => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: "Challenge created!",
        level: FeedbackLevel.Success,
        duration: 5000,
      });
    },
    onError: (e) => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: "Error creating challenge: " + e.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    setValid(false);
    debouncer.debounce(() => {
      try {
        const data = JSON.parse(challenge) as ChallengeUpload;
        setParsed(ChallengeUploadSchema.parse(data));
        setValid(true);
      } catch (e) {}
    });
  }, [challenge, setValid, setParsed, debouncer]);

  const { status, data: session } = useSession();

  const {
    createShown: shown,
    setCreateShown: setShown,
    setHowToShown,
    setHowToIndex,
  } = useContext(ModalContext);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="fixed left-0 top-0 z-50 flex min-h-full w-full flex-col items-center justify-center overflow-y-auto bg-black bg-opacity-50"
        >
          <div
            className={
              "m-2 flex h-fit w-3/4 flex-col items-center justify-center rounded-2xl px-0 pt-1 shadow-lg " +
              "overflow-y-auto border-2 border-teal-500 bg-stone-300 dark:bg-stone-800"
            }
          >
            <div className="flex w-full flex-col items-center justify-center gap-2 px-4 max-h-[95vh]">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold">Create a Challenge</p>
              <div className="w-full">
                <button
                  className={
                    "p-1 text-lg font-semibold hover:scale-105" +
                    colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                  }
                  onClick={() => {
                    setShown(false);
                    setHowToShown(true);
                    setHowToIndex(1);
                  }}
                >
                  <i>Learn about creating challenges</i>
                </button>
              </div>
              <textarea
                className={
                  "bg-grey-200 max-h-[75vh] w-full rounded-md p-2 font-mono text-black outline-none" +
                  (valid
                    ? " border-2 border-green-800 focus:border-green-500"
                    : " border-2 border-red-800 focus:border-red-500")
                }
                placeholder="Challenge JSON"
                value={challenge}
                onChange={(e) => {
                  setChallenge(e.target.value);
                  setValid(true);
                }}
                rows={10}
              ></textarea>
              <div className="m-2 flex flex-row items-center justify-center gap-2">
                <button
                  className={
                    "rounded-full px-4 py-2 font-semibold" +
                    colorFromFeedbackLevel(FeedbackLevel.Secondary, true)
                  }
                  onClick={() => {
                    setShown(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={
                    "rounded-full px-4 py-2 font-semibold" +
                    colorFromFeedbackLevel(FeedbackLevel.Success, true)
                  }
                  disabled={!valid || status !== "authenticated"}
                  onClick={() => {
                    if (valid && parsed) {
                      create(parsed);
                      setShown(false);
                    }
                  }}
                >
                  <span
                    data-tooltip-id={
                      status !== "authenticated" ? "login" : undefined
                    }
                  >
                    Create
                  </span>
                </button>
                {status !== "authenticated" && (
                  <Tooltip className="tooltip-overrides" id="login" place="top">
                    You must be logged in to upload a challenge.
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateChallengeModal;
