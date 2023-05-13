import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IChallenge } from "~/utils/odm";
import Test from "./Test";

type TestCarouselProps = {
  challenge: IChallenge;
  index: number;
  setIndex: (index: number) => void;
};
const TestCarousel: React.FC<TestCarouselProps> = ({
  challenge,
  index,
  setIndex,
}) => {
  const { tests } = challenge;

  const handleLeftClick = () => {
    setIndex((index - 1 + tests.length) % tests.length);
  };

  const handleRightClick = () => {
    setIndex((index + 1) % tests.length);
  };

  return (
    <div className="flex flex-col gap-2 w-1/2">
      <div className="flex justify-between w-full">
        <button
          className="bg-slate-300 p-2 hover:bg-slate-400 rounded h-fit w-fit"
          onClick={handleLeftClick}
        >
          <FontAwesomeIcon className="w-12 h-12 text-black" icon={faChevronLeft} />
        </button>
        <div className="font-semibold flex flex-row items-center justify-center text-2xl">
          {index + 1} / {tests.length}
        </div>
        <button
          className="bg-slate-300 p-2 hover:bg-slate-400 rounded h-fit w-fit"
          onClick={handleRightClick}
        >
          <FontAwesomeIcon className="w-12 h-12 text-black" icon={faChevronRight} />
        </button>
      </div>
      <Test
        test={tests[index]?.test || ""}
        expected={tests[index]?.expected || ""}
      />
    </div>
  );
};

export default TestCarousel;
