import { api } from "~/utils/api";
import Spinner from "./Spinner";
import ClampText from "./ClampText";
import { useSession } from "next-auth/react";
import { EditorContext } from "~/providers/editor";
import { useContext } from "react";
import { type ITest } from "~/utils/odm";

type TestRunsProps = {
  challengeId: string;
  tests: ITest[];
};
const TestRuns: React.FC<TestRunsProps> = ({ challengeId, tests }) => {
  const { status } = useSession();

  const { setTestIndex, setPrompts, setTrim, setCaseSensitive } =
    useContext(EditorContext);

  const { data: testRuns } = api.challenge.myTestRuns.useQuery(challengeId, {
    enabled: !!challengeId && status === "authenticated",
    refetchInterval: 1000,
  });

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-md py-4 align-middle">
      <h2 className="text-2xl">Test Runs</h2>
      {status === "authenticated" ? (
        <div className="flex w-full flex-col items-start justify-start divide-y-2 divide-gray-400 overflow-x-auto rounded-md border-2 text-black">
          {!!testRuns ? (
            testRuns.length > 0 ? (
              <table className="w-full table-auto">
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
                    <tr
                      key={index}
                      className={
                        "cursor-pointer bg-opacity-30 transition-all duration-200 ease-in-out" +
                        (testRun.success
                          ? " bg-green-300 hover:bg-green-400 dark:hover:bg-green-200"
                          : " bg-red-300 hover:bg-red-400 dark:hover:bg-red-200")
                      }
                      onClick={() => {
                        setTestIndex(testRun.testIndex);
                        setPrompts(testRun.prompts);
                        setTrim(testRun.trim);
                        setCaseSensitive(testRun.caseSensitive);
                      }}
                    >
                      <td className="px-1">{testRun.tokenCount}</td>
                      <td className="px-1">
                        <ClampText
                          maxLength={30}
                          text={testRun.prompts.join(" ")}
                          uid={`test-${index}`}
                        />
                      </td>
                      <td className="px-1">{testRun.trim ? "Yes" : "No"}</td>
                      <td className="px-1">
                        {testRun.caseSensitive ? "Yes" : "No"}
                      </td>
                      <td className="hidden px-1 md:table-cell">
                        <ClampText
                          maxLength={50}
                          text={`${testRun.testIndex} - ${
                            tests[testRun.testIndex]?.test ?? ""
                          }`}
                          uid={`test--${index}`}
                        />
                      </td>
                      <td className="px-1">
                        {testRun.success ? "Success" : "Failure"}
                      </td>
                    </tr>
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
