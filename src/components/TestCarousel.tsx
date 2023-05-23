import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IChallenge } from "~/utils/odm";
import Test from "./Test";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useContext } from "react";
import { EditorContext } from "~/providers/editor";

type TestCarouselProps = {
  challenge: IChallenge;
};
const TestCarousel: React.FC<TestCarouselProps> = ({ challenge }) => {
  const { tests } = challenge;

  const { testIndex, setTestIndex } = useContext(EditorContext);

  const handleLeftClick = () => {
    setTestIndex((testIndex - 1 + tests.length) % tests.length);
  };

  const handleRightClick = () => {
    setTestIndex((testIndex + 1) % tests.length);
  };

  return (
    <div className="flex min-w-[50%] flex-col gap-2">
      <div className="flex w-full justify-between">
        <button
          className={
            "h-fit w-fit rounded p-2 hover:scale-105" +
            colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
          }
          onClick={handleLeftClick}
        >
          <FontAwesomeIcon className="h-12 w-12" icon={faChevronLeft} />
        </button>
        <div className="flex flex-row items-center justify-center text-2xl font-semibold whitespace-nowrap">
          {testIndex + 1} / {tests.length}
        </div>
        <button
          className={
            "h-fit w-fit rounded p-2 hover:scale-105" +
            colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
          }
          onClick={handleRightClick}
        >
          <FontAwesomeIcon className="h-12 w-12" icon={faChevronRight} />
        </button>
      </div>
      <Test
        test={tests[testIndex]?.test || ""}
        expected={tests[testIndex]?.expected || ""}
      />
    </div>
  );
};

export default TestCarousel;
