/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { api } from "~/utils/api";
import Spinner from "./Spinner";
import ClampText from "./ClampText";
import { useSession } from "next-auth/react";

type TestRunsProps = {
  challengeId: string;
  setTestIndex: (index: number) => void;
  setPrompt: (prompt: string) => void;
  setTrim: (trim: boolean) => void;
  setCaseSensitive: (caseSensitive: boolean) => void;
};
const TestRuns: React.FC<TestRunsProps> = ({
  challengeId,
  setTestIndex,
  setPrompt,
  setTrim,
  setCaseSensitive,
}) => {
  const { data: testRuns } = api.challenge.myTestRuns.useQuery(challengeId, {
    enabled: !!challengeId,
    refetchInterval: 1000,
  });

  const { status } = useSession();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-md py-4 align-middle">
      <h2 className="text-2xl">Test Runs</h2>
      {status === "authenticated" ? (
        <div className="flex w-full flex-col items-start justify-start divide-y-2 divide-gray-400 rounded-md border-2 text-black">
          {!!testRuns ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th>Tokens</th>
                  <th>Prompt</th>
                  <th>Trim</th>
                  <th>Case Sensitive</th>
                  <th>Test Index</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {testRuns.length > 0 ? (
                  testRuns.map((testRun, index) => (
                    <tr
                      key={index}
                      className={
                        "cursor-pointer bg-opacity-30 transition-all duration-200 ease-in-out" +
                        (testRun.success
                          ? " bg-green-300 hover:bg-green-400 dark:hover:bg-green-200"
                          : " bg-red-300 hover:bg-red-400 dark:hover:bg-red-200")
                      }
                      onClick={() => {
                        setTestIndex(testRun.testIndex as number);
                        setPrompt(testRun.prompt as string);
                        setTrim(testRun.trim as boolean);
                        setCaseSensitive(testRun.caseSensitive as boolean);
                      }}
                    >
                      <td className="pl-1">{testRun.tokenCount}</td>
                      <td className="pl-1">
                        <ClampText
                          maxLength={12}
                          text={testRun.prompt as string}
                        />
                      </td>
                      <td className="pl-1">{testRun.trim ? "Yes" : "No"}</td>
                      <td className="pl-1">
                        {testRun.caseSensitive ? "Yes" : "No"}
                      </td>
                      <td className="pl-1">{testRun.testIndex}</td>
                      <td className="pl-1">
                        {testRun.success ? "Success" : "Failure"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <p className="text-lg">No test runs</p>
                )}
              </tbody>
            </table>
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
