import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopIn from "./PopIn";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";

type LikedProps = {
  liked: boolean;
  onClick: () => void;
};
const Liked: React.FC<LikedProps> = ({ liked, onClick }) => {
  return (
    <div
      className={
        "ml-6 inline-block h-8 w-8 font-semibold hover:scale-105" +
        colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
      }
      onClick={onClick}
    >
      <div className="absolute">
        <PopIn shown={liked}>
          <FontAwesomeIcon
            icon={faHeartSolid}
            className="h-8 w-8 text-pink-500"
          />
        </PopIn>
      </div>
      <div className="absolute">
        <PopIn shown={!liked}>
          <FontAwesomeIcon icon={faHeartRegular} className="h-8 w-8" />
        </PopIn>
      </div>
    </div>
  );
};

export default Liked;
