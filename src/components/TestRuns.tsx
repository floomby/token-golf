import { api } from "~/utils/api";
import Spinner from "./Spinner";
import ClampText from "./ClampText";

type TestRunsProps = {
  challengeId: string;
  setTestIndex: (index: number) => void;
  setPrompt: (prompt: string) => void;
};
const TestRuns: React.FC<TestRunsProps> = ({
  challengeId,
  setTestIndex,
  setPrompt,
}) => {
  const { data: testRuns } = api.challenge.myTestRuns.useQuery(challengeId, {
    enabled: !!challengeId,
    refetchInterval: 1000,
  });

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-md p-4 align-middle">
      <h2 className="text-2xl">Test Runs</h2>
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
                      "bg-opacity-30" +
                      (testRun.success
                        ? " bg-green-300 hover:bg-green-200"
                        : " bg-red-300 hover:bg-red-200")
                    }
                    onClick={() => {
                      console.log(testRun);
                      setTestIndex(testRun.testIndex);
                      setPrompt(testRun.prompt);
                    }}
                  >
                    <td className="pl-1">{testRun.tokenCount}</td>
                    <td className="pl-1">
                      <ClampText maxLength={12} text={testRun.prompt} />
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
    </div>
  );
};

export default TestRuns;
