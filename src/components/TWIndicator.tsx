// show which tailwind breakpoint is currently active

const TWIndicator: React.FC = () => {
  return (
    <>
      <p className="text-gray-500 sm:hidden md:hidden lg:hidden xl:hidden 2xl:hidden">
        xs
      </p>
      <p className="text-red-500 md:hidden lg:hidden xl:hidden 2xl:hidden sm:inline hidden">
        sm
      </p>
      <p className="text-green-500 sm:hidden lg:hidden xl:hidden 2xl:hidden md:inline hidden">
        md
      </p>
      <p className="text-blue-500 sm:hidden md:hidden xl:hidden 2xl:hidden lg:inline hidden">
        lg
      </p>
      <p className="text-yellow-500 sm:hidden md:hidden lg:hidden 2xl:hidden xl:inline hidden">
        xl
      </p>
      <p className="text-purple-500 sm:hidden md:hidden lg:hidden xl:hidden 2xl:inline hidden">
        2xl
      </p>
    </>
  );
};

export default TWIndicator;
