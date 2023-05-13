import { useEffect, useRef, useState } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import Graphemer from "graphemer";
import { compile } from "html-to-text";

import { get_encoding } from "@dqbd/tiktoken";

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
  mousePosition: { x: number; y: number };
  index: number;
  setInfoToken: (token: string | null) => void;
};
const HoverableText: React.FC<HoverableTextProps> = ({
  text,
  mousePosition,
  index,
  setInfoToken,
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const span = spanRef.current;
    if (!span) return;

    const rect = span.getBoundingClientRect();
    const topLeft = { x: rect.left, y: rect.top };
    const bottomRight = { x: rect.right, y: rect.bottom };

    const isHovered =
      mousePosition.x >= topLeft.x &&
      mousePosition.x <= bottomRight.x &&
      mousePosition.y >= topLeft.y &&
      mousePosition.y <= bottomRight.y;

    setHovered(isHovered);
    if (isHovered) {
      setInfoToken(text);
    }
  }, [spanRef, mousePosition]);

  return (
    <>
      <span
        ref={spanRef}
        className={
          "rounded-sm " +
          colorFromIndex(index) +
          (hovered ? " bg-red-400 bg-opacity-60" : " bg-opacity-40")
        }
      >
        {text}
      </span>
      {text === "\n" ? <br /> : null}
    </>
  );
};

const flattenSpanText = (html: string) => {
  // remove span tags
  const noSpan = html.replace(/<span[^>]*>/g, "").replace(/<\/span>/g, "");
  return noSpan;
};

type TokenInfoProps = {
  token: string;
};
const TokenInfo: React.FC<TokenInfoProps> = ({ token }) => {
  const encoding = encoder.encode(token, "all");

  return (
    <div className="w-48 flex flex-col justify-start gap-2">
      <h3 className="text-lg font-bold">"{token}"</h3>
      <h3 className="text-lg font-bold">Encoding: {encoding.join(", ")}</h3>
    </div>
  );
};

type PromptInputProps = {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
};
const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  onSubmit,
}) => {
  // we will have a hidden contenteditablediv that will be edited and then we will wrap each character when we display it

  const editableRef = useRef<HTMLDivElement>(null);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [segments, setSegments] = useState<ReturnType<typeof getSegments>>([]);
  const [infoToken, setInfoToken] = useState<string | null>(null);

  useEffect(() => {
    const segments = getSegments(prompt);
    // console.log("segments", segments);
    setSegments(segments);
    setInfoToken(null);
    // check if the prompt has newlines
    if (/\n/g.test(prompt)) {
      console.log("newlines detected");
    }
  }, [prompt]);

  const [content, setContent] = useState<string>("");

  return (
    <div className="flex flex-row items-center justify-center gap-4">
      <div className="relative h-16 w-96 text-black">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full rounded-md border-2">
          {segments.map((segment, i) => (
            <HoverableText
              key={i}
              index={i}
              text={segment.text}
              mousePosition={mousePosition}
              setInfoToken={setInfoToken}
            />
          ))}
        </div>
        <div
          className="absolute left-0 top-0 h-full w-full rounded-md border-2 border-gray-300 bg-gray-200"
          contentEditable={true}
          suppressContentEditableWarning={true}
          onInput={(e) => {
            const text = compiledConvert(e.currentTarget.innerText);
            // Idk if this makes any sense
            console.log("text", text);
            setPrompt(text);
            // if (e.currentTarget.innerHTML !== text) {
            //   const replacement = text.replace(/\n/g, "<br/>");
            //   console.log("replacing", e.currentTarget.innerHTML, replacement);
            //   e.currentTarget.innerText = replacement;
            // }
            console.log("here");
            const replaced = flattenSpanText(e.currentTarget.innerHTML);
            if (replaced !== e.currentTarget.innerHTML) {
              console.log("replacing", replaced, text);
              e.currentTarget.innerHTML = text;
            }
          }}
          ref={editableRef}
          onClick={(e) => {
            console.log("editable click", e);
          }}
          onMouseMove={(e) => {
            setInfoToken(null);
            setMousePosition({ x: e.clientX, y: e.clientY });
          }}
        ></div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="text-2xl">Token Count: {segments.length}</h2>
        <TokenInfo token={infoToken ?? ""} />
        <button
          className={
            "rounded-lg px-4 py-2" +
            colorFromFeedbackLevel(FeedbackLevel.Success, true)
          }
          onClick={onSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default PromptInput;
