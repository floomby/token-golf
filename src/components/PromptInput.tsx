import { useContext, useEffect, useState } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
// import { compile } from "html-to-text";
import { api } from "~/utils/api";
import { useNotificationQueue } from "~/providers/notifications";
import Toggle from "./Toggle";
import { countTokens, encoder, getSegments } from "~/utils/tokenize";
import { Tooltip } from "react-tooltip";
import { useSession } from "next-auth/react";
import { SubmissionModalContext } from "~/providers/submissionModal";
import { EditorContext } from "~/providers/editor";

// const compiledConvert = compile({ wordwrap: false, preserveNewlines: true });

const colorFromIndex = (index: number) => {
  switch (index % 3) {
    case 0:
      return " bg-blue-300";
    case 1:
      return " bg-green-300";
    case 2:
      return " bg-yellow-300";
  }
};

type HoverableTextProps = {
  text: string;
  index: number;
  setInfoToken: (token: string | null) => void;
};
const HoverableText: React.FC<HoverableTextProps> = ({
  text,
  index,
  setInfoToken,
}) => {
  const newLineCount = text.split("\n").length - 1;

  const linebreaks = (
    <>
      {new Array(newLineCount).fill(0).map((_, idx) => (
        <br key={idx} />
      ))}
    </>
  );

  return (
    <>
      <span
        className={`rounded-sm hover:bg-red-400 hover:bg-opacity-60 ${
          colorFromIndex(index) || ""
        }`}
        onMouseEnter={() => {
          setInfoToken(text);
        }}
      >
        {text.replace(/ /g, "\u00a0")}
      </span>
      {linebreaks}
    </>
  );
};

type TokenInfoProps = {
  token: string;
};
const TokenInfo: React.FC<TokenInfoProps> = ({ token }) => {
  const encoding = encoder.encode(token, "all");

  return (
    <div className="flex w-48 flex-col justify-start gap-2">
      <h3 className="text-lg font-bold">&quot;{token}&quot;</h3>
      <h3 className="text-lg font-bold">Encoding: {encoding.join(", ")}</h3>
    </div>
  );
};

type PromptInputProps = {
  challengeId: string;
};
const PromptInput: React.FC<PromptInputProps> = ({ challengeId }) => {
  const { setShown: setSubmissionModalShown, setDetailsId } = useContext(
    SubmissionModalContext
  );

  const notifications = useNotificationQueue();

  const {
    prompt,
    setPrompt,
    testIndex,
    trim,
    setTrim,
    caseSensitive,
    setCaseSensitive,
  } = useContext(EditorContext);

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
      console.log("HERE");
      notifications.add(id, {
        message: data.success
          ? "Success!"
          : undefined,
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
              setSubmissionModalShown(true);
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

  const [segments, setSegments] = useState<ReturnType<typeof getSegments>>([]);
  const [infoToken, setInfoToken] = useState<string | null>(null);

  const { status } = useSession();

  useEffect(() => {
    const segments = getSegments(prompt);
    setSegments(segments);
    setInfoToken(null);
  }, [prompt]);

  return (
    <div className="flex w-full items-start justify-center gap-4 sm:flex-col md:flex-col lg:flex-col xl:flex-row 2xl:flex-row">
      <div className="flex flex-col items-start justify-center gap-2 sm:w-full md:w-full lg:w-full xl:basis-1/2 2xl:basis-1/2">
        <textarea
          className="min-h-[128px] w-full rounded-md border-2 border-gray-300 bg-gray-200 text-black"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.currentTarget.value);
          }}
          style={{
            wordBreak: "normal",
          }}
          rows={10}
        />
        <div className="flex w-full justify-between gap-4 sm:flex-col md:flex-row lg:flex-row xl:flex-col 2xl:flex-row">
          <div className="flex flex-row items-center justify-start gap-8">
            <div className="mt-2">
              <Toggle label="Trim" checked={trim} setChecked={setTrim} />
            </div>
            <div className="mt-2">
              <Toggle
                label="Case Sensitive"
                checked={caseSensitive}
                setChecked={setCaseSensitive}
              />
            </div>
          </div>
          <div
            className="flex flex-row items-center gap-2 sm:justify-start md:justify-end lg:justify-end xl:justify-start 2xl:justify-end"
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
                    prompt,
                    testIndex,
                    challengeId,
                    trim,
                    caseSensitive,
                  });
                } else {
                  void runSingleTestAnon({
                    prompt,
                    testIndex,
                    challengeId,
                    trim,
                    caseSensitive,
                  });
                }
              }}
              // disabled={status !== "authenticated"}
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
                  setSubmissionModalShown(true);
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
                    prompt,
                    challengeId,
                    trim,
                    caseSensitive,
                  });
                } else {
                  void submitAnon({
                    prompt,
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
              <Tooltip id={"run-tooltip"}>Log In to Save Results</Tooltip>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-center gap-2 sm:w-full md:w-full lg:w-full xl:basis-1/2 2xl:basis-1/2">
        <div
          className="min-h-[128px] w-full rounded-md border-2 bg-gray-300 text-black"
          style={{
            wordBreak: "break-word",
          }}
        >
          {segments.map((segment, i) => (
            <HoverableText
              key={i}
              index={i}
              text={segment.text}
              setInfoToken={setInfoToken}
            />
          ))}
        </div>
        <h2 className="text-xl">
          Token Count: {segments.length > 0 ? countTokens(segments) : 0}
        </h2>
        <TokenInfo token={infoToken ?? ""} />
      </div>
    </div>
  );
};

export default PromptInput;
