import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";

type PromptInputProps = {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
};
const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  onSubmit,
}) => {
  return (
    <div className="flex flex-row items-center justify-center gap-4">
      <textarea
        className="h-32 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 p-2 text-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className={
          "rounded-lg px-4 py-2" +
          colorFromFeedbackLevel(FeedbackLevel.Success, true)
        }
        onClick={onSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default PromptInput;
