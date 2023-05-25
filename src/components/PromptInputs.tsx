import { use, useContext, useEffect, useState } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { api } from "~/utils/api";
import { useNotificationQueue } from "~/providers/notifications";
import Toggle from "./Toggle";
import { getSegments } from "~/utils/tokenize";
import { Tooltip } from "react-tooltip";
import { useSession } from "next-auth/react";
import { ModalContext } from "~/providers/modal";
import { EditorContext } from "~/providers/editor";
import PromptInput from "./PromptInput";

type PromptInputsProps = {
  challengeId: string;
};
const PromptInputs: React.FC<PromptInputsProps> = ({ challengeId }) => {
  const { setSubmissionShown, setDetailsId } = useContext(ModalContext);

  const notifications = useNotificationQueue();

  const [edited, setEdited] = useState(false);

  const {
    prompts,
    setPrompts,
    setPrompt,
    testIndex,
    trim,
    setTrim,
    caseSensitive,
    setCaseSensitive,
    counts,
    setCounts,
    setCount,
    totalCount,
  } = useContext(EditorContext);

  useEffect(() => {
    if (prompts[0]!.length > 0) {
      setEdited(true);
    }
  }, [prompts, setEdited]);

  const { mutate: runSingleTest } = api.challenge.runSingleTest.useMutation({
    onSuccess: (data) => {
      const id = Math.random().toString();
      notifications.add(id, {
        html: data.success
          ? `<b>Success:</b> <code>&quot;${data.result}&quot;</code>`
          : `<b>Failed:</b> <code>&quot;${data.result}&quot;</code>`,
        level: data.success ? FeedbackLevel.Success : FeedbackLevel.Warning,
        duration: 5000,
      });
    },
    onError: (error) => {
      const id = Math.random().toString();
      notifications.add(id, {
        message: error.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
  });

  const { mutate: runSingleTestAnon } =
    api.challenge.runSingleTestAnon.useMutation({
      onSuccess: (data) => {
        const id = Math.random().toString();
        notifications.add(id, {
          html: data.success
            ? `<b>Success:</b> <code>&quot;${data.result}&quot;</code>`
            : `<b>Failed:</b> <code>&quot;${data.result}&quot;</code>`,
          level: data.success ? FeedbackLevel.Success : FeedbackLevel.Warning,
          duration: 5000,
        });
      },
      onError: (error) => {
        const id = Math.random().toString();
        notifications.add(id, {
          message: error.message,
          level: FeedbackLevel.Error,
          duration: 5000,
        });
      },
    });

  const { mutate: runAllTests } = api.challenge.submit.useMutation({
    onSuccess: (data) => {
      const id = Math.random().toString();
      notifications.add(id, {
        message: data.success ? "Success!" : undefined,
        html: data.success
          ? undefined
          : `Failed test(s): ${data.results
              .map((r, i) => ({ idx: i + 1, suc: r.success }))
              .filter((r) => !r.suc)
              .map((r) => r.idx)
              .join(", ")}<br />
              <i>Click to view details</i>`,
        level: data.success ? FeedbackLevel.Success : FeedbackLevel.Warning,
        duration: 5000,
        onClick: data.success
          ? undefined
          : () => {
              setDetailsId(data._id.toString());
              setSubmissionShown(true);
            },
      });
    },
    onError: (error) => {
      const id = Math.random().toString();
      notifications.add(id, {
        message: error.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
  });

  const { mutate: submitAnon } = api.challenge.submitAnon.useMutation({
    onSuccess: (data) => {
      const id = Math.random().toString();
      notifications.add(id, {
        message: data.success
          ? "Success!"
          : `Failed test(s): ${data.results
              .map((r, i) => ({ idx: i + 1, suc: r.success }))
              .filter((r) => !r.suc)
              .map((r) => r.idx)
              .join(", ")}`,
        level: data.success ? FeedbackLevel.Success : FeedbackLevel.Warning,
        duration: 5000,
      });
    },
    onError: (error) => {
      const id = Math.random().toString();
      notifications.add(id, {
        message: error.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
  });

  const { status } = useSession();

  return (
    <div className="flex w-full flex-col items-start justify-center gap-2">
      {prompts.map((prompt, index) => (
        <PromptInput
          prompt={prompts[index]!}
          setPrompt={(value) => setPrompt(value, index)}
          key={index}
          index={index}
          edited={edited}
          removeStage={() => {
            // slice out this stage
            const newPrompts = [...prompts];
            newPrompts.splice(index, 1);
            setPrompts(newPrompts);
            const newCounts = [...counts];
            newCounts.splice(index, 1);
            setCounts(newCounts);
          }}
          insertStage={() => {
            // insert a new stage after this one
            const newPrompts = [...prompts];
            newPrompts.splice(index + 1, 0, "");
            setPrompts(newPrompts);
            const newCounts = [...counts];
            newCounts.splice(index + 1, 0, 0);
            setCounts(newCounts);
          }}
          tokenCount={counts[index]!}
          setTokenCount={setCount}
        />
      ))}
      <p className="text-xl">Total tokens: {totalCount}</p>
      <div className="flex w-full flex-col-reverse justify-between gap-4 md:flex-row xl:flex-col 2xl:flex-row">
        <div className="flex flex-row items-center justify-start gap-8">
          <div className="mt-2">
            <Toggle
              label="Trim"
              checked={trim}
              setChecked={setTrim}
              tooltip="Enable/disable whitespace trimming of llm output"
              uid="trim-toggle"
            />
          </div>
          <div className="mt-2">
            <Toggle
              label="Case Sensitive"
              checked={caseSensitive}
              setChecked={setCaseSensitive}
              tooltip="Enable/disable case sensitivity for llm output"
              uid="case-toggle"
            />
          </div>
        </div>
        <div
          className="md:flex-center flex flex-col items-start justify-start gap-2 md:flex-row md:justify-end xl:justify-start 2xl:justify-end"
          data-tooltip-id={
            status === "authenticated" ? undefined : "run-tooltip"
          }
        >
          <button
            className={
              "whitespace-nowrap rounded-full px-4 py-2 font-semibold" +
              colorFromFeedbackLevel(FeedbackLevel.Secondary, true)
            }
            onClick={() => {
              if (status === "authenticated") {
                void runSingleTest({
                  prompts,
                  testIndex,
                  challengeId,
                  trim,
                  caseSensitive,
                });
              } else {
                void runSingleTestAnon({
                  prompts,
                  testIndex,
                  challengeId,
                  trim,
                  caseSensitive,
                });
              }
            }}
          >
            Run Single Test
          </button>
          <button
            className={
              "whitespace-nowrap rounded-full px-4 py-2 font-semibold" +
              colorFromFeedbackLevel(FeedbackLevel.Secondary, true)
            }
            onClick={() => {
              if (status === "authenticated") {
                setSubmissionShown(true);
              }
            }}
            disabled={status !== "authenticated"}
          >
            View Submission Details
          </button>
          <button
            className={
              "whitespace-nowrap rounded-full px-4 py-2 font-semibold" +
              colorFromFeedbackLevel(FeedbackLevel.Success, true)
            }
            onClick={() => {
              if (status === "authenticated") {
                void runAllTests({
                  prompts,
                  challengeId,
                  trim,
                  caseSensitive,
                });
              } else {
                void submitAnon({
                  prompts,
                  challengeId,
                  trim,
                  caseSensitive,
                });
              }
            }}
          >
            Submit
          </button>
          {status === "authenticated" ? null : (
            <Tooltip className="tooltip-overrides" id="run-tooltip">
              Log In to Save Results
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptInputs;
