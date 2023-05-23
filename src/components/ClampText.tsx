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
    <span className="truncate" data-tooltip-id={`tooltip-${uid}`}>
      {text.length > maxLength ? text.substring(0, maxLength) + "..." : text}
      <Tooltip className="tooltip-overrides" id={`tooltip-${uid}`}>{text}</Tooltip>
    </span>
  ) : (
    <span>{text}</span>
  );
};

export default ClampText;
