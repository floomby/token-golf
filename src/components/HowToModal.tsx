import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { ModalContext } from "~/providers/modal";

const HowToModal: React.FC = () => {
  const {
    howToIndex: index,
    setHowToIndex: setIndex,
    howToShown: shown,
    setHowToShown: setShown,
    setCreateShown,
  } = useContext(ModalContext);

  const handleLeftClick = () => {
    setIndex((index - 1 + howTo.length) % howTo.length);
  };

  const handleRightClick = () => {
    setIndex((index + 1) % howTo.length);
  };

  const howTo = [
    <div className="flex flex-col items-start justify-center gap-4" key={0}>
      <h2 className="text-2xl font-semibold">Writing a Prompt</h2>
      <p className="text-lg">
        A prompt is a template which will be interpolated with the input. The
        objective is to have the next tokens completed by the LLM match the
        expected output for every test in the challenge.
      </p>
      <p className="text-lg">
        The test content is interpolated using the <code>{"{input}"}</code>{" "}
        variable similar to how a{" "}
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
        <b>Question</b> - But inference isn&apos;t deterministic, even at zero
        temperature. Doesn&apos;t that make this whole thing screwy?
        <br />
        <b>Answer</b> - Work around this. Every test in the challenge is run
        once on submission with the requirement that they all pass. If you are
        getting inconsistent results on a given test then try changing your
        prompt or just resubmit if you are feeling lucky.
      </p>
      <p className="text-lg">
        <b>Question</b> - Why do none of the leaderboard prompts work?
        <br />
        <b>Answer</b> - Because the model that was used originally changed, and
        I did not bother to remove the existing submissions.
      </p>
      <p className="text-lg">
        <b>Tip</b> - While working on the problem you can run individual tests.
        You can see the results of these at the bottom of the challenge page.
        You can recall the previous prompts and settings used to run these tests
        by clicking on the entries in this history.
      </p>
    </div>,
    <div className="flex flex-col items-start justify-center gap-4" key={1}>
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
      <button
        className={
          "mt-4 rounded-full px-4 py-2 font-semibold" +
          colorFromFeedbackLevel(FeedbackLevel.Secondary, true)
        }
        onClick={() => {
          setShown(false);
          setCreateShown(true);
        }}
      >
        Create one now!
      </button>
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
            <div className="flex max-h-[74vh] w-full flex-row items-center justify-between gap-4 overflow-y-auto px-4">
              <button
                onClick={handleLeftClick}
                className={
                  "hidden text-2xl hover:scale-105 md:flex" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                }
              >
                <FontAwesomeIcon className="h-20 w-12" icon={faChevronLeft} />
              </button>
              {howTo[index]}
              <button
                onClick={handleRightClick}
                className={
                  "hidden text-2xl hover:scale-105 md:flex" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                }
              >
                <FontAwesomeIcon className="h-20 w-12" icon={faChevronRight} />
              </button>
            </div>
            <div className="flex w-full flex-row items-center justify-between px-2 pt-4 md:justify-center md:pt-0">
              <button
                onClick={handleLeftClick}
                className={
                  "flex text-2xl hover:scale-105 md:hidden" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                }
              >
                <FontAwesomeIcon
                  className="mt-2 h-10 w-12"
                  icon={faChevronLeft}
                />
              </button>
              <button
                onClick={() => setShown(false)}
                className={
                  "mt-4 rounded-full px-4 py-2 font-semibold" +
                  colorFromFeedbackLevel(FeedbackLevel.Secondary, true)
                }
              >
                Close
              </button>

              <button
                onClick={handleRightClick}
                className={
                  "flex text-2xl hover:scale-105 md:hidden" +
                  colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
                }
              >
                <FontAwesomeIcon
                  className="mt-2 h-10 w-12"
                  icon={faChevronRight}
                />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HowToModal;
