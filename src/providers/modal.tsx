import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

export type ModalContextType = {
  submissionShown: boolean;
  setSubmissionShown: (shown: boolean) => void;
  challengeId: string | null;
  setChallengeId: (challengeId: string | null) => void;
  detailsId: string | null;
  setDetailsId: (detailsId: string | null) => void;
  howToShown: boolean;
  setHowToShown: (shown: boolean) => void;
  howToIndex: number;
  setHowToIndex: (index: number) => void;
  createShown: boolean;
  setCreateShown: (shown: boolean) => void;
  navShown: boolean;
  setNavShown: (shown: boolean) => void;
};

const ModalContext = createContext<ModalContextType>({
  submissionShown: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSubmissionShown: () => {},
  challengeId: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setChallengeId: () => {},
  detailsId: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setDetailsId: () => {},
  howToShown: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setHowToShown: () => {},
  howToIndex: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setHowToIndex: () => {},
  createShown: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCreateShown: () => {},
  navShown: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setNavShown: () => {},
});

export { ModalContext };

type ModalProviderProps = {
  children: React.ReactNode;
};
const ModalProvider: React.FC<ModalProviderProps> = ({
  children,
}) => {
  const [shown, setShown] = useState<boolean>(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [howToShown, setHowToShown] = useState<boolean>(false);
  const [howToIndex, setHowToIndex] = useState<number>(0);
  const [createShown, setCreateShown] = useState<boolean>(false);
  const [navShown, setNavShown] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      setShown(false);
      setDetailsId(null);
      setHowToShown(false);
      setCreateShown(false);
      setNavShown(false);
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events, setShown, setDetailsId, setHowToShown, setHowToIndex, setCreateShown, setNavShown]);

  return (
    <ModalContext.Provider
      value={{
        submissionShown: shown,
        setSubmissionShown: setShown,
        challengeId,
        setChallengeId,
        detailsId,
        setDetailsId,
        howToShown,
        setHowToShown,
        howToIndex,
        setHowToIndex,
        createShown,
        setCreateShown,
        navShown,
        setNavShown,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
