import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Test from "./Test";
import { ModalContext } from "~/providers/modal";
import { EditorContext } from "~/providers/editor";

const ChallengeSubmissionsModal: React.FC = () => {
  const router = useRouter();

  const notifications = useNotificationQueue();

  const {
    submissionShown: shown,
    setSubmissionShown: setShown,
    challengeId,
    detailsId,
    setDetailsId,
  } = useContext(ModalContext);

  const { setPrompt, setTrim, setCaseSensitive, setTestIndex } =
    useContext(EditorContext);

  const { data: runs, refetch } = api.challenge.getMyResults.useQuery(
    challengeId ?? "",
    {
      enabled: shown && !!challengeId,
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

  useEffect(() => {
    if (shown && !!challengeId) {
      void refetch();
    }
  }, [shown, challengeId, refetch]);

  const { data: result } = api.challenge.getResult.useQuery(detailsId ?? "", {
    enabled: shown && !!challengeId && !!detailsId,
    onError: (error) => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: "Error loading submission results: " + error.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
  });

  const { data: challenge } = api.challenge.read.useQuery(challengeId ?? "", {
    enabled: shown && !!challengeId,
    onError: (error) => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: "Error loading challenge: " + error.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
  });

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
              "m-2 flex min-w-[50%] flex-col items-center justify-center rounded-2xl px-0 pt-1 shadow-lg " +
              "h-fit border-2 border-teal-500 bg-stone-300 text-black dark:bg-stone-800 dark:text-white"
            }
          >
            {!detailsId ? (
              <>
                <h1 className="text-2xl font-bold">Past Submissions</h1>
                <div className="max-h-[80vh] w-full overflow-y-auto">
                  <table className="w-full table-auto">
                    <thead className="text-left">
                      <tr>
                        <th className="px-2 py-1">Tokens</th>
                        <th className="px-2 py-1">Results</th>
                        <th className="px-2 py-1">Date</th>
                        <th className="px-2 py-1"></th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {runs?.map((run, i) => {
                        const successCount = run.results.filter(
                          (r) => r.success
                        ).length;

                        return (
                          <tr
                            key={i}
                            className={
                              "cursor-pointer bg-opacity-30" +
                              // mongoose type inference fail...
                              ((run as unknown as { success: boolean }).success
                                ? " bg-green-200 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700"
                                : " bg-red-200 hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700")
                            }
                            onClick={() => {
                              if (
                                !router.pathname.includes("/challenges/") &&
                                challengeId
                              ) {
                                void router.push(
                                  `/challenges/${challengeId}/${run._id.toString()}`
                                );
                                return;
                              }

                              setTestIndex(0);
                              setPrompt(run.prompt);
                              setTrim(run.trim);
                              setCaseSensitive(run.caseSensitive);
                              setShown(false);
                            }}
                          >
                            <td className="pl-1">{run.tokenCount}</td>
                            <td className="pl-1">
                              {successCount}/{run.results.length}
                            </td>
                            <td className="pl-1">
                              {new Date(run.at).toLocaleString()}
                            </td>
                            <td className="pl-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailsId(run._id.toString());
                                }}
                                className="h-full translate-y-[3px] px-1 transition-all duration-200 ease-in-out hover:scale-110 hover:text-blue-500"
                              >
                                <FontAwesomeIcon
                                  icon={faChevronRight}
                                  className="h-full w-4"
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">
                  {`Submission Log${
                    // if we have the data show how many tests passed out of the total
                    result
                      ? ` (${result.results.filter((r) => r.success).length}/${
                          challenge?.tests.length ?? ""
                        })`
                      : ""
                  }`}
                </h1>
                {!!challenge && (
                  <div className="max-h-[80vh] w-full divide-y-2 divide-gray-700 overflow-y-auto px-2 dark:divide-gray-300">
                    {result?.results.map((result, i) => (
                      <Test
                        className="pt-2"
                        key={i}
                        test={challenge.tests[i]?.test ?? ""}
                        expected={challenge.tests[i]?.expected ?? ""}
                        result={result}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="m-2 flex flex-row items-center justify-center gap-2">
              {!!detailsId && (
                <button
                  className={
                    "rounded-full px-4 py-2 font-semibold" +
                    colorFromFeedbackLevel(FeedbackLevel.Secondary, true)
                  }
                  onClick={() => {
                    setDetailsId(null);
                  }}
                >
                  Back
                </button>
              )}
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
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChallengeSubmissionsModal;
