import { AnimatePresence, motion } from "framer-motion";
import { useNotificationQueue } from "../providers/notifications";
import Notification from "./Notification";

const NotificationList: React.FC = () => {
  const queue = useNotificationQueue();

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 100,
        top: 16,
        left: "50%",
        transform: "translate(-50%, 0)",
      }}
    >
      <AnimatePresence>
        {queue.entries.map(({ id, data }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          >
            <Notification
              id={id}
              message={data.message}
              html={data.html}
              duration={data.duration}
              level={data.level}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationList;
