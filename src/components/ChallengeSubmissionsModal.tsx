import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";

type ChallengeSubmissionsModalProps = {
  shown: boolean;
  setShown: (show: boolean) => void;
  challengeId: string;
  setTestIndex: (index: number) => void;
  setPrompt: (prompt: string) => void;
  setTrim: (trim: boolean) => void;
  setCaseSensitive: (caseSensitive: boolean) => void;
};
const ChallengeSubmissionsModal: React.FC<ChallengeSubmissionsModalProps> = ({
  shown,
  setShown,
  challengeId,
  setTestIndex,
  setPrompt,
  setTrim,
  setCaseSensitive,
}) => {
  const router = useRouter();

  const notifications = useNotificationQueue();

  const { data: challenges } = api.challenge.getMyResults.useQuery(
    challengeId,
    {
      enabled: shown,
      onError: (error) => {
        const id = Math.random().toString(36).substring(7);
        notifications.add(id, {
          message: "Error loading challenge: " + error.message,
          level: FeedbackLevel.Error,
          duration: 5000,
        });
      },
    }
  );

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
              "m-2 flex h-fit min-w-[50%] flex-col items-center justify-center rounded-2xl px-0 pt-1 shadow-lg " +
              "overflow-y-auto border-2 border-teal-500 bg-stone-300 dark:bg-stone-800"
            }
          >
            <table className="w-full">
              <thead className="text-left">
                <tr>
                  <th className="px-2 py-1">Tokens</th>
                  <th className="px-2 py-1">Results</th>
                  <th className="px-2 py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {challenges?.map((challenge, i) => {
                  const successCount = challenge.results.filter(
                    (r) => r.success
                  ).length;

                  return (
                    <tr
                      key={i}
                      className={
                        "bg-opacity-30 cursor-pointer" +
                        // bad mongoose typing out of the projection...
                        ((challenge as unknown as { success: boolean }).success
                          ? " bg-green-300 hover:bg-green-200"
                          : " bg-red-300 hover:bg-red-200")
                      }
                      onClick={() => {
                        if (!router.pathname.includes("/challenges/")) {
                          void router.push(`/challenges/${challengeId}/${challenge._id}`);
                          return;
                        }

                        setTestIndex(0);
                        setPrompt(challenge.prompt);
                        setTrim(challenge.trim);
                        setCaseSensitive(challenge.caseSensitive);
                        setShown(false);
                      }}
                    >
                      <td className="pl-1">{challenge.tokenCount}</td>
                      <td className="pl-1">
                        {successCount}/{challenge.results.length}
                      </td>
                      <td className="pl-1">
                        {new Date(challenge.at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="m-2 flex flex-row items-center justify-center gap-2">
              <button
                className={
                  "rounded px-4 py-2 font-semibold" +
                  colorFromFeedbackLevel(FeedbackLevel.Secondary, true)
                }
                onClick={() => {
                  setShown(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChallengeSubmissionsModal;
