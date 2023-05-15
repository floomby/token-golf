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
};
const Notification: React.FC<NotificationProps> = ({
  id,
  message,
  html,
  duration,
  level,
}) => {
  const notifications = useNotificationQueue();

  useEffect(() => {
    const timeout = setTimeout(() => {
      notifications.remove(id);
    }, duration);
    return (): void => {
      clearTimeout(timeout);
    };
  }, [id, duration, notifications]);

  return (
    <div
      className={
        "m-4 flex rounded-md p-4 shadow-md" + colorFromFeedbackLevel(level)
      }
    >
      {message && <p>{message}</p>}
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  );
};

export default Notification;
