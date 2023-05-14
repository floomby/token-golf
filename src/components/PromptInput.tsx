import { useEffect, useRef, useState } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import Graphemer from "graphemer";
import { compile } from "html-to-text";
import { api } from "~/utils/api";
import { get_encoding } from "@dqbd/tiktoken";
import { useNotificationQueue } from "~/providers/notifications";
import Toggle from "./Toggle";

const encoder = get_encoding("cl100k_base");
const textDecoder = new TextDecoder();
const graphemer = new Graphemer();

const compiledConvert = compile({ wordwrap: false, preserveNewlines: true });

export function getSegments(inputText: string) {
  const encoding = encoder.encode(inputText, "all");
  const segments: { text: string; tokens: { id: number; idx: number }[] }[] =
    [];

  let byteAcc: number[] = [];
  let tokenAcc: { id: number; idx: number }[] = [];
  let inputGraphemes = graphemer.splitGraphemes(inputText);

  for (let idx = 0; idx < encoding.length; idx++) {
    const token = encoding[idx]!;
    byteAcc.push(...encoder.decode_single_token_bytes(token));
    tokenAcc.push({ id: token, idx });

    const segmentText = textDecoder.decode(new Uint8Array(byteAcc));
    const graphemes = graphemer.splitGraphemes(segmentText);

    if (graphemes.every((item, idx) => inputGraphemes[idx] === item)) {
      segments.push({ text: segmentText, tokens: tokenAcc });

      byteAcc = [];
      tokenAcc = [];
      inputGraphemes = inputGraphemes.slice(graphemes.length);
    }
  }

  // NOTE: I can use this approach, but there are a bunch of edge cases that I have to handle manually
  // Furthermore this doesn't even accurately match what is ultimately used in the tokenization after
  // the template is filled in with the test input text
  // Replace (90,1379,92) with (-1)
  // Replace (314,1379,92) with a (220,-1)

  // let splicedOut = 0;

  // for (let idx = 0; idx < segments.length; idx++) {
  //   for (let i = 0; i < segments[idx]!.tokens.length; i++) {
  //     segments[idx]!.tokens[i]!.idx -= splicedOut;
  //   }

  //   if (
  //     segments[idx]!.tokens[0]!.id === 90 &&
  //     segments[idx + 1]?.tokens[0]!.id === 1379 &&
  //     segments[idx + 2]?.tokens[0]!.id === 92
  //   ) {
  //     segments[idx] = {
  //       text: "{input}",
  //       tokens: [{ id: -1, idx: segments[idx]!.tokens[0]!.idx - splicedOut }],
  //     };
  //     // splice out the next 2 segments
  //     segments.splice(idx + 1, 2);
  //     splicedOut += 2;
  //   } else {
  //     if (
  //       segments[idx]!.tokens[0]!.id === 314 &&
  //       segments[idx + 1]?.tokens[0]!.id === 1379 &&
  //       segments[idx + 2]?.tokens[0]!.id === 92
  //     ) {
  //       segments[idx] = {
  //         text: " ",
  //         tokens: [
  //           { id: 220, idx: segments[idx]!.tokens[0]!.idx - splicedOut },
  //         ],
  //       };
  //       segments[idx + 1] = {
  //         text: "{input}",
  //         tokens: [
  //           { id: -1, idx: segments[idx + 1]!.tokens[0]!.idx - splicedOut + 1 },
  //         ],
  //       };

  //       // splice out the next segment
  //       segments.splice(idx + 2, 1);
  //       splicedOut += 1;
  //     }
  //   }
  // }

  return segments;
}

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
        className={
          "rounded-sm hover:bg-red-400 hover:bg-opacity-60" +
          colorFromIndex(index)
        }
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
      <h3 className="text-lg font-bold">"{token}"</h3>
      <h3 className="text-lg font-bold">Encoding: {encoding.join(", ")}</h3>
    </div>
  );
};

type PromptInputProps = {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  testIndex: number;
  challengeId: string;
};
const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  onSubmit,
  testIndex,
  challengeId,
}) => {
  const notifications = useNotificationQueue();

  const { mutate: runSingleTest } = api.challenge.runSingleTest.useMutation({
    onSuccess: (data) => {
      const id = Math.random().toString();
      notifications.add(id, {
        message: JSON.stringify(data),
        level: FeedbackLevel.Success,
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

  useEffect(() => {
    const segments = getSegments(prompt);
    setSegments(segments);
    setInfoToken(null);
  }, [prompt]);

  const [trim, setTrim] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);

  return (
    <div className="flex w-full flex-row items-start justify-center gap-4">
      <div className="flex basis-1/2 flex-col items-start justify-center gap-2">
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
        <div className="flex flex-row items-center justify-start gap-8">
          <div className="basis-1/2">
            <Toggle label="Trim" checked={trim} setChecked={setTrim} />
          </div>
          <div className="basis-1/2">
            <Toggle
              label="Case Sensitive"
              checked={caseSensitive}
              setChecked={setCaseSensitive}
            />
          </div>
        </div>
      </div>
      <div className="flex basis-1/2 flex-col items-start justify-center gap-2">
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
        <h2 className="text-xl">Token Count: {segments.length}</h2>
        <TokenInfo token={infoToken ?? ""} />
        <button
          className={
            "rounded-lg px-4 py-2" +
            colorFromFeedbackLevel(FeedbackLevel.Success, true)
          }
          onClick={() => {
            void runSingleTest({ prompt, testIndex, challengeId, trim, caseSensitive });
          }}
        >
          Run
        </button>
      </div>
    </div>
  );
};

export default PromptInput;
