type TestProps = {
  test: string;
  expected: string;
};
const Test: React.FC<TestProps> = ({ test, expected }) => {
  return (
    <div className="my-2 flex flex-col gap-2">
      <div
        className="border-teal rounded-lg border-2 bg-slate-300 p-2 font-semibold text-black"
        style={{
          wordBreak: "break-word",
        }}
      >
        Test Case: <span className="font-mono border-2 border-gray-500 p-1 rounded-sm">{test}</span>
      </div>
      <div className="border-teal rounded-lg border-2 bg-slate-300 p-2 font-semibold text-black">
        Expected Output:{" "}
        <span className="font-mono border-2 border-gray-500 p-1 rounded-sm">{expected}</span>
      </div>
    </div>
  );
};

export default Test;
