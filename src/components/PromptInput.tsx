import { use, useEffect, useRef, useState } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import Graphemer from "graphemer";

import { get_encoding } from "@dqbd/tiktoken";

const encoder = get_encoding("cl100k_base");
const textDecoder = new TextDecoder();
const graphemer = new Graphemer();

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

type HoverableTextProps = {
  text: string;
  mousePosition: { x: number; y: number };
};
const HoverableText: React.FC<HoverableTextProps> = ({
  text,
  mousePosition,
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
  }, [spanRef, mousePosition]);

  return (
    <span
      ref={spanRef}
      className={"rounded-sm" + (hovered ? " bg-blue-300 bg-opacity-40" : "")}
    >
      {text}
    </span>
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
  const overlayRef = useRef<HTMLDivElement>(null);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [segments, setSegments] = useState<ReturnType<typeof getSegments>>(
    []
  );

  useEffect(() => {
    const segments = getSegments(prompt);
    console.log("segments", segments);
    setSegments(segments);
  }, [prompt]);

  return (
    <div className="flex flex-row items-center justify-center gap-4">
      <div className="relative h-16 w-96">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full rounded-md border-2">
          {/* {prompt.split("").map((char, i) => (
            <HoverableText key={i} text={char} mousePosition={mousePosition} />
          ))} */}
          {segments.map((segment, i) => (
            <HoverableText
              key={i}
              text={segment.text}
              mousePosition={mousePosition}
            />
          ))}
        </div>
        <div
          className="absolute left-0 top-0 h-full w-full rounded-md border-2 border-gray-300 bg-red-200 text-black"
          contentEditable={true}
          suppressContentEditableWarning={true}
          onInput={(e) => {
            setPrompt(e.currentTarget.innerText);
          }}
          ref={editableRef}
          onClick={(e) => {
            console.log("editable click", e);
          }}
          onMouseMove={(e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
          }}
        ></div>
      </div>
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
  );
};

export default PromptInput;
