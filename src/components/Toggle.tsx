import { Tooltip } from "react-tooltip";

type ToggleProps = {
  label: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
  tooltip?: string;
};
const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  setChecked,
  tooltip,
}) => {
  // take at most the first 5 non-whitespace characters of the label
  const nonWhitespaceLabel = label.replace(/\s/g, "").substring(0, 5);

  return (
    <label
      className="relative inline-flex cursor-pointer items-center text-black dark:text-white"
      data-tooltip-id={tooltip ? `${nonWhitespaceLabel}-toggle-tooltip` : undefined}
    >
      <input
        type="checkbox"
        checked={checked}
        className="peer sr-only"
        onChange={() => setChecked(!checked)}
      ></input>
      { /* prettier-ignore */ }
      <div className="w-11 h-6
  rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px]
  bg-purple-200 dark:bg-gray-900
  hover:bg-purple-300 dark:hover:bg-gray-900
  ring-2 ring-purple-300 dark:ring-purple-700 hover:ring-4
  peer-checked:after:border-purple-300 dark:peer-checked:after:border-purple-300
  after:bg-teal-700 dark:after:bg-teal-200
  after:border-secondary dark:after:border-secondaryDark
  after:rounded-full after:h-5 after:w-5 after:transition-all
  peer-checked:bg-teal-900 dark:peer-checked:bg-indigo-800
  dark:peer-checked:hover:bg-purple-700"></div>
      <span className="text-md text-primary ml-2 whitespace-nowrap font-medium">
        {label}
      </span>
      {tooltip && <Tooltip id={`${nonWhitespaceLabel}-toggle-tooltip`}>{tooltip}</Tooltip>}
    </label>
  );
};

export default Toggle;
