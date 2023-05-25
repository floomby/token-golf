import Graphemer from "graphemer";
import { get_encoding } from "@dqbd/tiktoken";

const encoder = get_encoding("cl100k_base");
const textDecoder = new TextDecoder();
const graphemer = new Graphemer();

const getSegments = (inputText: string) => {
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
};

const countTokens = (segments: { text: string; tokens: { id: number; idx: number }[] }[]) => {
  // just return the last index of the last token
  if (segments.length === 0) {
    return 0;
  }

  return segments[segments.length - 1]!.tokens[
    segments[segments.length - 1]!.tokens.length - 1
  ]!.idx + 1;
};

export type SegmentsType = ReturnType<typeof getSegments>;

export { encoder, getSegments, countTokens };
