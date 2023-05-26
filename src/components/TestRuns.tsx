import { api } from "~/utils/api";
import Spinner from "./Spinner";
import ClampText from "./ClampText";
import { useSession } from "next-auth/react";
import { EditorContext } from "~/providers/editor";
import { useContext, useEffect, useRef, useState } from "react";
import { type ITest } from "~/utils/odm";
import { AnimatePresence, motion } from "framer-motion";
import mongoose from "mongoose";
import Test, { type TestProps } from "./Test";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";

type ExpanderProps = {
  expanded: boolean;
  success: boolean;
  restore: () => void;
  prompts: string[];
} & TestProps;
const Expander: React.FC<ExpanderProps> = ({
  expanded,
  success,
  test,
  expected,
  result,
  className,
  prompts,
  restore,
}) => {
  return (
    <tr className="border-0">
      <td colSpan={6} className="">
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className={
                "flex w-full flex-col items-center overflow-y-hidden px-2 pb-1 text-black dark:text-white" +
                (success
                  ? " bg-green-100 dark:bg-green-950"
                  : " bg-red-100 dark:bg-red-950")
              }
            >
              <Test
                test={test}
                expected={expected}
                result={result}
                className={className}
                prompts={prompts}
              />
              <button
                className={
                  "w-full rounded px-2 font-semibold" +
                  colorFromFeedbackLevel(FeedbackLevel.Info, true)
                }
                onClick={() => {
                  restore();
                }}
              >
                Restore
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </tr>
  );
};

type TestRunProps = {
  prompts: string[];
  trim: boolean;
  caseSensitive: boolean;
  tokenCount: number;
  at: Date;
  testIndex: number;
  result: string;
  success: boolean;
  intermediates: string[];
  onClick: () => void;
  index: number;
  tests: ITest[];
  expanded: boolean;
  id: mongoose.Types.ObjectId;
};
const TestRun: React.FC<TestRunProps> = ({
  prompts,
  trim,
  caseSensitive,
  tokenCount,
  at,
  testIndex,
  result,
  success,
  intermediates,
  onClick,
  index,
  tests,
  expanded,
  id,
}) => {
  const { setTestIndex, setPrompts, setTrim, setCaseSensitive } =
    useContext(EditorContext);

  const trRef = useRef<HTMLTableRowElement>(null);

  const { scrollTestTarget } = useContext(EditorContext);

  useEffect(() => {
    if (scrollTestTarget === id.toString()) {
      trRef.current?.scrollIntoView({
        behavior: "smooth",
      });
      if (!expanded) onClick();
    }
  }, [scrollTestTarget]);

  return (
    <>
      <tr
        className={
          "cursor-pointer border-0 bg-opacity-30 align-top transition-all duration-200 ease-in-out" +
          (success
            ? " bg-green-300 hover:bg-green-400 dark:bg-green-100 dark:hover:bg-green-200"
            : " bg-red-300 hover:bg-red-400 dark:bg-red-100 dark:hover:bg-red-200")
        }
        onClick={() => {
          onClick();
        }}
        ref={trRef}
      >
        <td className="px-1">
          <p>{tokenCount}</p>
        </td>
        <td className="px-1">
          <ClampText
            maxLength={30}
            text={prompts.join(" ")}
            uid={`test-${index}`}
          />
        </td>
        <td className="px-1">{trim ? "Yes" : "No"}</td>
        <td className="px-1">{caseSensitive ? "Yes" : "No"}</td>
        <td className="hidden px-1 md:table-cell">
          <ClampText
            maxLength={50}
            text={`${testIndex} - ${tests[testIndex]?.test ?? ""}`}
            uid={`test--${index}`}
          />
        </td>
        <td className="px-1">{success ? "Success" : "Failure"}</td>
      </tr>
      <Expander
        expanded={expanded}
        success={success}
        test={tests[testIndex]?.test ?? ""}
        expected={tests[testIndex]?.expected ?? ""}
        result={{
          result,
          intermediates,
          success,
        }}
        className="px-1"
        restore={() => {
          setTestIndex(testIndex);
          setPrompts(prompts);
          setTrim(trim);
          setCaseSensitive(caseSensitive);
        }}
        prompts={prompts}
      />
    </>
  );
};

type TestRunsProps = {
  tests: ITest[];
  testRuns:
    | {
        prompts: string[];
        trim: boolean;
        caseSensitive: boolean;
        tokenCount: number;
        at: Date;
        testIndex: number;
        result: string;
        success: boolean;
        intermediates: string[];
        id: mongoose.Types.ObjectId;
      }[]
    | undefined;
};
const TestRuns: React.FC<TestRunsProps> = ({ tests, testRuns }) => {
  const { status } = useSession();

  const [expandedId, setExpandedId] = useState("");

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-md py-4 align-middle">
      <h2 className="text-2xl">Test Runs</h2>
      {status === "authenticated" ? (
        <div className="flex w-full flex-col items-start justify-start divide-y-2 divide-gray-400 overflow-x-auto rounded-md border-2 text-black">
          {!!testRuns ? (
            testRuns.length > 0 ? (
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="pr-1">Tokens</th>
                    <th className="pr-1">Prompt</th>
                    <th className="pr-1">Trim</th>
                    <th className="pr-1">Case Sensitive</th>
                    <th className="hidden pr-1 md:table-cell">Test</th>
                    <th className="pr-1">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {testRuns.map((testRun, index) => (
                    <TestRun
                      key={index}
                      {...testRun}
                      index={index}
                      tests={tests}
                      onClick={() => {
                        if (expandedId === testRun.id.toString()) {
                          setExpandedId("");
                        } else {
                          setExpandedId(testRun.id.toString());
                        }
                      }}
                      expanded={expandedId === testRun.id.toString()}
                    />
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="ml-2 text-lg font-semibold dark:text-white">
                No test runs
              </p>
            )
          ) : (
            <div className="flex w-full items-center justify-center">
              <Spinner />
            </div>
          )}
        </div>
      ) : (
        <div className="flex w-full items-center justify-center">
          <p className="text-lg">Log in to view your test results</p>
        </div>
      )}
    </div>
  );
};

export default TestRuns;
