import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";

type HowToModalProps = {
  shown: boolean;
  setModalShown: (show: boolean) => void;
};
const HowToModal: React.FC<HowToModalProps> = ({ shown, setModalShown }) => {
  const [index, setIndex] = useState<number>(0);

  const handleLeftClick = () => {
    setIndex((index - 1 + howTo.length) % howTo.length);
  };

  const handleRightClick = () => {
    setIndex((index + 1) % howTo.length);
  };

  const howTo = [
    <div className="flex flex-col items-start justify-center gap-4">
      <h2 className="text-2xl font-semibold">Writing a Prompt</h2>
      <p className="text-lg">
        A prompt is a template which will be interpolated with the test input.
        The objective is to have the next tokens completed by the LLM match the
        expected output for every test in the challenge.
      </p>
      <p className="text-lg">
        The test content is interpolated using the <code>{"{test}"}</code>{" "}
        variable in the exact same way a{" "}
        <a
          href="https://js.langchain.com/docs/modules/prompts/prompt_templates/"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          langchain template
        </a>{" "}
        works.
      </p>
      <p className="text-lg">
        Beyond writing a prompt you may also opt to trim whitespace from the
        output as well as control case sensitivity.
      </p>
      <p className="text-lg">
        <b>Question</b> - But inference isn't deterministic, even at zero
        temperature. Doesn't that make this whole thing screwy?
        <br />
        <b>Answer</b> - Work around this. Every test in the challenge is run
        once on submission with the requirement that they all pass. If you are
        getting inconsistent results on a given test then try changing your
        prompt or just resubmit if you are feeling lucky.
      </p>
      <p className="text-lg">
        <b>Tip</b> - While working on the problem you can run individual tests.
        You can see the results of these at the bottom of the challenge page.
        You can recall the previous prompts and settings used to run these tests
        by clicking on the entries in this history.
      </p>
    </div>,
    <div className="flex flex-col items-start justify-center gap-4">
      <h2 className="text-2xl font-semibold">Creating a Challenge</h2>
      <p>
        You can create your own challenges. Doing this requires creating a JSON
        representation of the challenge. <br /> The structure should be as
        follows:
      </p>
      <div className="rounded-lg border-2 border-gray-400 p-4">
        <code style={{ whiteSpace: "pre-wrap", display: "block" }}>
          {`{
  "name": string,
  "description": string,
  "tests": [
    {
      "test": string,
      "expected": string,
    }
  ],
}`}
        </code>
      </div>
    </div>,
  ];

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-50 px-4"
        >
          <div className="flex flex-col items-center justify-between rounded-lg bg-slate-200 py-4 shadow-lg dark:bg-slate-900">
            <div className="flex max-h-[80vh] w-full flex-row items-center justify-between gap-4 overflow-y-auto px-4">
              <button
                onClick={handleLeftClick}
                className={
                  "text-2xl hover:scale-105" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                }
              >
                <FontAwesomeIcon className="h-20 w-fit" icon={faChevronLeft} />
              </button>
              {howTo[index]}
              <button
                onClick={handleRightClick}
                className={
                  "text-2xl hover:scale-105" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                }
              >
                <FontAwesomeIcon className="h-20 w-fit" icon={faChevronRight} />
              </button>
            </div>
            <button
              onClick={() => setModalShown(false)}
              className={
                "mt-4 rounded-full px-4 py-2" +
                colorFromFeedbackLevel(FeedbackLevel.Secondary, true)
              }
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HowToModal;
