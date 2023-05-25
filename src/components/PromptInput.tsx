import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { EditorContext } from "~/providers/editor";
import { encoder } from "~/utils/tokenize";

// prettier-ignore
const instructions =
`Instructions to the language model on how to the problem.
The test text is substituted into {input}
The final output must match the expected value.

The following is an example.

=====================

Classify the following into as either an "Animal" or a "Vehicle"

{input}

classification: `;

// prettier-ignore
const chainInstructions =
`Additional stages process the output of a previous stage.
This allows processing output from a previous stage in order to solve the problem with multiple steps.

The output from the previous stage is substituted into {input}.`

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
    <div className="ml-1 flex flex-col justify-start">
      <h3 className="text-lg font-bold">&quot;{token}&quot;</h3>
      <h3 className="text-lg font-bold">Encoding: {encoding.join(", ")}</h3>
    </div>
  );
};

type PromptInputProps = {
  prompt: string;
  setPrompt: (prompt: string) => void;
  index: number;
  edited: boolean;
  removeStage: () => void;
  insertStage: () => void;
};
const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  index,
  edited,
  removeStage,
  insertStage,
}) => {
  // const [segments, setSegments] = useState<ReturnType<typeof getSegments>>([]);
  const [infoToken, setInfoToken] = useState<string | null>(null);

  const { counts, segments } = useContext(EditorContext);

  // useEffect(() => {
  //   const segments = getSegments(prompt ?? "");
  //   setSegments(segments);
  //   setInfoToken(null);
  // }, [prompt]);

  // useEffect(() => {
  //   console.log(
  //     "token count",
  //     segments.length > 0 ? countTokens(segments) : 0,
  //     index,
  //     updateIndex
  //   );
  //   setCount(segments.length > 0 ? countTokens(segments) : 0, index);
  // }, [segments, updateIndex]);

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg bg-slate-300 p-1 dark:bg-cyan-950">
      <div className="mt-1 flex w-full flex-row items-center justify-end">
        <button
          className={
            "hover:scale-105" +
            colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
          }
          onClick={() => {
            removeStage();
          }}
        >
          <FontAwesomeIcon icon={faX} className="h-8 w-8" />
        </button>
        <button
          className={
            "hover:scale-110" +
            colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
          }
          onClick={() => {
            insertStage();
          }}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="h-8 w-8 rotate-90 transform"
          />
        </button>
      </div>
      <div className="flex w-full flex-col items-start justify-center gap-2 xl:flex-row">
        <textarea
          className="flex min-h-[128px] w-full rounded-md border-2 border-gray-300 bg-gray-200 text-black placeholder:text-gray-800 xl:w-auto xl:basis-1/2"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.currentTarget.value);
          }}
          style={{
            wordBreak: "normal",
          }}
          rows={10}
          placeholder={
            edited ? "" : index === 0 ? instructions : chainInstructions
          }
        />
        <div className="flex w-full flex-col items-start justify-center sm:w-full md:w-full lg:w-full xl:basis-1/2 2xl:basis-1/2">
          <div
            className="min-h-[128px] w-full rounded-md border-2 bg-gray-300 text-black"
            style={{
              wordBreak: "break-word",
            }}
          >
            {segments[index]!.map((segment, i) => (
              <HoverableText
                key={i}
                index={i}
                text={segment.text}
                setInfoToken={setInfoToken}
              />
            ))}
          </div>
          <h2 className="ml-1 text-xl">Token Count: {counts[index]}</h2>
          <TokenInfo token={infoToken ?? ""} />
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
