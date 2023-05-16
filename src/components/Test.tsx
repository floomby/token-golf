import { IResult } from "~/utils/odm";

type TestProps = {
  test: string;
  expected: string;
  result?: IResult;
  className?: string;
};
const Test: React.FC<TestProps> = ({ test, expected, result, className }) => {
  return (
    <div className={"my-2 flex flex-col gap-2 " + (className ?? "")}>
      <div
        className="rounded-lg bg-slate-300 p-2 font-semibold text-black"
        style={{
          wordBreak: "break-word",
        }}
      >
        Test Case:{" "}
        <span className="rounded-sm border-2 border-gray-500 p-1 font-mono">
          {test}
        </span>
      </div>
      <div className="rounded-lg bg-slate-300 p-2 font-semibold text-black">
        Expected Output:{" "}
        <span className="rounded-sm border-2 border-gray-500 p-1 font-mono">
          {expected}
        </span>
      </div>
      {!!result && (
        <div
          className={
            "rounded-lg bg-slate-300 p-2 font-semibold text-black dark:text-white" +
            (result.success
              ? " border-green-500 bg-green-200 dark:bg-green-900"
              : " border-red-500 bg-red-200 dark:bg-red-900")
          }
        >
          Received Output:{" "}
          <span className="rounded-sm border-2 border-gray-500 p-1 font-mono">
            {expected}
          </span>
        </div>
      )}
    </div>
  );
};

export default Test;
