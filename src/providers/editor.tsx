import { useRouter } from "next/router";
import { createContext, useCallback, useEffect, useState } from "react";

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
  setCounts: (counts: number[]) => void;
  setCount: (count: number, index: number) => void;
  totalCount: number;
};

const EditorContext = createContext<EditorContextType>({
  prompts: [""],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPrompts: () => { },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPrompt: () => { },
  testIndex: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setTestIndex: () => { },
  trim: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setTrim: () => { },
  caseSensitive: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCaseSensitive: () => { },
  counts: [0],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCounts: () => { },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCount: () => { },
  totalCount: 0,
});

export { EditorContext };

type EditorProviderProps = {
  children: React.ReactNode;
};
const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [prompts, setPrompts] = useState<string[]>([""]);
  const [testIndex, setTestIndex] = useState(0);
  const [trim, setTrim] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [counts, setCounts_] = useState<number[]>([0]);
  const [totalCount, setTotalCount] = useState(0);

  const setPrompt = useCallback(
    (prompt: string, index: number) => {
      const newPrompts = [...prompts];
      newPrompts[index] = prompt;
      setPrompts(newPrompts);
    }, [prompts, setPrompts]);

  const setCount = useCallback(
    (count: number, index: number) => {
      const newCounts = [...counts];
      newCounts[index] = count;
      setCounts_(newCounts);
      setTotalCount(newCounts.reduce((a, b) => a + b, 0));
    }, [counts, setCounts_, setTotalCount]);

  const setCounts = useCallback(
    (counts: number[]) => {
      setCounts_(counts);
      setTotalCount(counts.reduce((a, b) => a + b, 0));
    }, [setCounts_, setTotalCount]);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => setTestIndex(0);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events, setTestIndex]);

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
        setCounts,
        setCount,
        totalCount,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider;
