import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

export type EditorContextType = {
  prompt: string;
  setPrompt: (prompt: string) => void;
  testIndex: number;
  setTestIndex: (testIndex: number) => void;
  trim: boolean;
  setTrim: (trim: boolean) => void;
  caseSensitive: boolean;
  setCaseSensitive: (caseSensitive: boolean) => void;
};

const EditorContext = createContext<EditorContextType>({
  prompt: "",
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
});

export { EditorContext };

type EditorProviderProps = {
  children: React.ReactNode;
};
const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const [prompt, setPrompt] = useState("");
  const [testIndex, setTestIndex] = useState(0);
  const [trim, setTrim] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => setTestIndex(0);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events, setTestIndex]);

  return (
    <EditorContext.Provider
      value={{
        prompt,
        setPrompt,
        testIndex,
        setTestIndex,
        trim,
        setTrim,
        caseSensitive,
        setCaseSensitive,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider;
