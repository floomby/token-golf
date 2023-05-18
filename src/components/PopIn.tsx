import { AnimatePresence, motion } from "framer-motion";

type PopInProps = {
  shown: boolean;
  children: React.ReactNode;
  direction?: "left" | "right";
  fullWidth?: boolean;
};
const PopIn: React.FC<PopInProps> = ({
  shown,
  children,
  direction,
  fullWidth,
}) => {
  const initial = direction
    ? {
        x: ((x: number) => (fullWidth ? x * 4 : x))(
          direction === "left" ? -200 : 200
        ),
        y: 50,
        rotate: direction === "left" ? -20 : 20,
      }
    : {};
  const animate = direction ? { x: 0, y: 0, rotate: 0 } : {};
  const exit = direction
    ? {
        x: direction === "left" ? 200 : -200,
        y: 50,
        rotate: direction === "left" ? -20 : 20,
      }
    : {};

  return (
    <>
      <AnimatePresence>
        {shown && (
          <motion.div
            initial={{ scale: 0, opacity: 0, ...initial }}
            animate={{ scale: 1, opacity: 1, ...animate }}
            exit={{ scale: 0, opacity: 0, ...exit }}
            transition={{ duration: 0.3 }}
            className={fullWidth ? "w-full" : ""}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PopIn;
