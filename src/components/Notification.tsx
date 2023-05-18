import { useEffect } from "react";
import {
  type FeedbackLevel,
  useNotificationQueue,
} from "../providers/notifications";
import { colorFromFeedbackLevel } from "../lib/feedback";

type NotificationProps = {
  id: string;
  message?: string;
  html?: string;
  level: FeedbackLevel;
  duration: number;
  onClick?: () => void;
};
const Notification: React.FC<NotificationProps> = ({
  id,
  message,
  html,
  duration,
  level,
  onClick,
}) => {
  const notifications = useNotificationQueue();

  // I think this might be buggy
  useEffect(() => {
    const timeout = setTimeout(() => {
      notifications.remove(id);
    }, duration);
    return (): void => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, duration]);

  const clickCallback = (): void => {
    if (onClick) {
      onClick();
      notifications.remove(id);
    }
  };

  return (
    <div
      className={
        "m-4 flex rounded-md p-4 shadow-md" +
        colorFromFeedbackLevel(level, !!onclick) +
        (onClick
          ? " cursor-pointer transition-all duration-200 ease-in-out hover:scale-105"
          : "")
      }
      onClick={clickCallback}
    >
      {message && <p>{message}</p>}
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  );
};

export default Notification;
