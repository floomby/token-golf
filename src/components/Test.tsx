type TestProps = {
  test: string;
  expected: string;
};
const Test: React.FC<TestProps> = ({ test, expected }) => {
  return (
    <div className="flex flex-col gap-2 my-2">
      <div className="border-2 border-teal text-black font-semibold bg-slate-300 p-2 rounded-lg">{test}</div>
      <div className="border-2 border-teal text-black font-semibold bg-slate-300 p-2 rounded-lg">{expected}</div>
    </div>
  );
};

export default Test;
