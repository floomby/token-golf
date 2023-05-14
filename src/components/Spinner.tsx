type SpinnerProps = {
  className?: string;
};
const Spinner: React.FC<SpinnerProps> = ({ className }) => {
  return (
    <div className={"flex justify-center items-center m-4 " + (className ?? "")}>
      <div className="animate-spin rounded-full h-32 w-32 border-b-8 border-blue-400"></div>
    </div>
  );
};

export default Spinner;
