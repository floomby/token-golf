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
};

const countTokens = (segments: { text: string; tokens: { id: number; idx: number }[] }[]) => {
  // just return the last index of the last token
  return segments[segments.length - 1]!.tokens[
    segments[segments.length - 1]!.tokens.length - 1
  ]!.idx;
};

export { encoder, getSegments, countTokens };
