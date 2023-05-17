import { createContext, useEffect, useState } from "react";

const WidthContext = createContext<{
  width: number;
  setWidth: (width: number) => void;
}>({
  width: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setWidth: () => {},
});

export { WidthContext };

type WidthProviderProps = {
  children: React.ReactNode;
};
const WidthProvider: React.FC<WidthProviderProps> = ({ children }) => {
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    setWidth(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <WidthContext.Provider value={{ width, setWidth }}>
      {children}
    </WidthContext.Provider>
  );
};

export default WidthProvider;
