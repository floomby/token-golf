// Make text max length in a span and add a tooltip if it's too long

import { useMemo } from "react";
import { Tooltip } from "react-tooltip";

type ClampTextProps = {
  text: string;
  maxLength: number;
};
const ClampText: React.FC<ClampTextProps> = ({
  text,
  maxLength,
}: ClampTextProps) => {
  const uid = useMemo(() => Math.random().toString(36).substring(2, 15), []);

  return text.length > maxLength ? (
    <span
      className="truncate"
      data-tooltip-html={text.replace(/ /g, "\u00a0").replace(/\n/g, "<br />")}
      id={`tooltip-${uid}`}
    >
      {text.length > maxLength ? text.substring(0, maxLength) + "..." : text}
      <Tooltip anchorId={`tooltip-${uid}`} />
    </span>
  ) : (
    <span>{text}</span>
  );
};

export default ClampText;
