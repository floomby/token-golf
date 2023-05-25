import { useRouter } from "next/router";
import { createContext, useCallback, useEffect, useState } from "react";
import { countTokens, getSegments, type SegmentsType } from "~/utils/tokenize";

export type EditorContextType = {
  prompts: string[];
  setPrompts: (prompts: string[]) => void;
  setPrompt: (prompt: string, index: number) => void;
  testIndex: number;
  setTestIndex: (testIndex: number) => void;
  trim: boolean;
  setTrim: (trim: boolean) => void;
  caseSensitive: boolean;
  setCaseSensitive: (caseSensitive: boolean) => void;
  counts: number[];
  totalCount: number;
  segments: SegmentsType[];
  scrollTestTarget: string;
  setScrollTestTarget: (target: string) => void;
};

const EditorContext = createContext<EditorContextType>({
  prompts: [""],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPrompts: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPrompt: () => {},
  testIndex: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setTestIndex: () => {},
  trim: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setTrim: () => {},
  caseSensitive: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCaseSensitive: () => {},
  counts: [0],
  totalCount: 0,
  segments: [],
  scrollTestTarget: "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setScrollTestTarget: () => {},
});

export { EditorContext };

type EditorProviderProps = {
  children: React.ReactNode;
};
const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [prompts, setPrompts_] = useState<string[]>([""]);
  const [counts, setCounts] = useState<number[]>([0]);
  const [segments, setSegments] = useState<SegmentsType[]>([[]]);
  const [totalCount, setTotalCount] = useState(0);
  const [testIndex, setTestIndex] = useState(0);
  const [trim, setTrim] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [scrollTestTarget, setScrollTestTarget] = useState("");

  const setPrompt = useCallback(
    (prompt: string, index: number) => {
      const newPrompts = [...prompts];
      newPrompts[index] = prompt;
      setPrompts_(newPrompts);
      const newSegments = [...segments];
      newSegments[index] = getSegments(prompt);
      setSegments(newSegments);
      if (segments[index]) {
        const newCounts = [...counts];
        newCounts[index] = countTokens(segments[index]!);
        setCounts(newCounts);
        setTotalCount(newCounts.reduce((a, b) => a + b, 0));
      }
    },
    [prompts, setPrompts_]
  );

  const setPrompts = useCallback(
    (prompts: string[]) => {
      setPrompts_(prompts);
      const newSegments = prompts.map((prompt) => getSegments(prompt));
      setSegments(newSegments);
      const newCounts = newSegments.map((segment) =>
        segment ? countTokens(segment) : 0
      );
      setCounts(newCounts);
      setTotalCount(newCounts.reduce((a, b) => a + b, 0));
    },
    [setPrompts_, setSegments, setCounts, setTotalCount]
  );

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      setTestIndex(0);
      setScrollTestTarget("");
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events, setTestIndex, setScrollTestTarget]);

  return (
    <EditorContext.Provider
      value={{
        prompts,
        setPrompts,
        setPrompt,
        testIndex,
        setTestIndex,
        trim,
        setTrim,
        caseSensitive,
        setCaseSensitive,
        counts,
        totalCount,
        segments,
        scrollTestTarget,
        setScrollTestTarget,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider;
