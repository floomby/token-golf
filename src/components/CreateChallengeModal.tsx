import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { colorFromFeedbackLevel, FeedbackLevel } from "../lib/feedback";
import { Debouncer } from "~/lib/debouncers";
import { type ChallengeUpload, ChallengeUploadSchema } from "~/utils/schemas";
import { api } from "~/utils/api";
import { useNotificationQueue } from "~/providers/notifications";

type CreateChallengeModalProps = {
  shown: boolean;
  setModalShown: (shown: boolean) => void;
};
const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  shown,
  setModalShown,
}) => {
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
      } catch (e) {
      }
    });
  }, [challenge, setValid, setParsed, debouncer]);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
          className="fixed left-0 top-0 z-50 flex min-h-full w-full flex-col items-center justify-center overflow-y-auto bg-black bg-opacity-50"
        >
          <div
            className={
              "w-3/4 m-2 flex h-fit flex-col items-center justify-center rounded-2xl px-0 pt-1 shadow-lg " +
              "overflow-y-auto border-2 border-teal-500 bg-stone-300 dark:bg-stone-800"
            }
          >
            <div className="flex flex-col items-center justify-center gap-2 w-full px-4">
              <h2 className="text-md font-bold">Upload a challenge</h2>
              <textarea
                className={
                  "bg-grey-200 h-32 w-full rounded-md p-2 text-black outline-none font-mono" +
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
              ></textarea>
              <div className="m-2 flex flex-row items-center justify-center gap-2">
                <button
                  className={
                    "rounded px-4 py-2 font-semibold" +
                    colorFromFeedbackLevel(FeedbackLevel.Secondary, true)
                  }
                  onClick={() => {
                    setModalShown(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={
                    "rounded px-4 py-2 font-semibold" +
                    colorFromFeedbackLevel(FeedbackLevel.Success, true)
                  }
                  disabled={!valid}
                  onClick={() => {
                    if (valid && parsed) {
                      create(parsed);
                      setModalShown(false);
                    }
                  }}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateChallengeModal;
