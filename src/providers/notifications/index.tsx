import { createNotificationContext } from "react-notification-provider";
import { FeedbackLevel } from "../../lib/feedback";

// You can customize the notification interface to include whatever props your notifications need to render.
interface Notification {
  message: string;
  duration: number;
  level: FeedbackLevel;
}

// This function creates a React context and hooks for you so you'll want to export these.
const { NotificationProvider, useNotificationQueue } =
  createNotificationContext<Notification>();

export { NotificationProvider, useNotificationQueue, FeedbackLevel };
