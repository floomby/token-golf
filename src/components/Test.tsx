import { type IResult } from "~/utils/odm";

type TestProps = {
  test: string;
  expected: string;
  result?: IResult;
  className?: string;
};
const Test: React.FC<TestProps> = ({ test, expected, result, className }) => {
  return (
    <div className={"my-2 flex w-full flex-col gap-2 " + (className ?? "")}>
      <div className="grid w-full grid-cols-4 gap-2 rounded-lg bg-slate-300 p-2 font-semibold text-black">
        <span className="col-span-1">Test Case</span>
        <div className="col-span-3">
          <code
            className="whitespace-pre-wrap rounded-sm border-2 border-gray-500 p-1"
            style={{
              wordBreak: "break-word",
              display: "block",
            }}
          >
            {test}
          </code>
        </div>
        <span className="col-span-1">Expected Output</span>
        <div className="col-span-3">
          <code
            className="whitespace-pre-wrap rounded-sm border-2 border-gray-500 p-1"
            style={{
              wordBreak: "break-word",
              display: "block",
            }}
          >
            {expected}
          </code>
        </div>
      </div>
      {!!result && (
        <div
          className={
            "grid w-full grid-cols-4 gap-2 rounded-lg p-2 font-semibold text-black ring-2 dark:text-white" +
            (result.success
              ? " bg-green-200 ring-green-500 dark:bg-green-900"
              : " bg-red-200 ring-red-500 dark:bg-red-900")
          }
        >
          {result.intermediates.length > 0 && (
            <>
              <span className="col-span-1">Intermediates</span>
              <div className="col-span-3">
                <code
                  className="whitespace-pre-wrap rounded-sm border-2 border-gray-500 p-1"
                  style={{
                    wordBreak: "break-word",
                    display: "block",
                  }}
                >
                  {result.intermediates.join("\n")}
                </code>
              </div>
            </>
          )}
          <span className="col-span-1">Produced Output</span>
          <div className="col-span-3">
            <code
              className="whitespace-pre-wrap rounded-sm border-2 border-gray-500 p-1"
              style={{
                wordBreak: "break-word",
                display: "block",
              }}
            >
              {result.result}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default Test;
