import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopIn from "./PopIn";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { Tooltip } from "react-tooltip";
import { useMemo } from "react";

type LikedProps = {
  liked: boolean;
  likes: number;
  onClick: () => void;
};
const Liked: React.FC<LikedProps> = ({ liked, likes, onClick }) => {
  const uid = useMemo(() => Math.random().toString(36).substring(2, 15), []);

  return (
    <div
      className="ml-6 inline-block h-8 w-8 font-semibold"
      onClick={onClick}
      data-tooltip-id={`liked-${uid}`}
    >
      <div
        className={
          "absolute hover:scale-105" +
          colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
        }
      >
        <PopIn shown={liked}>
          <FontAwesomeIcon
            icon={faHeartSolid}
            className="h-8 w-8 text-pink-500 transition-all duration-200 ease-in-out hover:text-pink-600 dark:hover:text-pink-400"
          />
        </PopIn>
      </div>
      <div
        className={
          "absolute hover:scale-105" +
          colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
        }
      >
        <PopIn shown={!liked}>
          <FontAwesomeIcon icon={faHeartRegular} className="h-8 w-8" />
        </PopIn>
      </div>
      <Tooltip className="tooltip-overrides select-none" id={`liked-${uid}`} place="bottom">
        {likes} {likes === 1 ? "like" : "likes"}
      </Tooltip>
    </div>
  );
};

export default Liked;
