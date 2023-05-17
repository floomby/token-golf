import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

export type SubmissionModalContextType = {
  shown: boolean;
  setShown: (shown: boolean) => void;
  challengeId: string | null;
  setChallengeId: (challengeId: string | null) => void;
  detailsId: string | null;
  setDetailsId: (detailsId: string | null) => void;
};

const SubmissionModalContext = createContext<SubmissionModalContextType>({
  shown: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setShown: () => {},
  challengeId: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setChallengeId: () => {},
  detailsId: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setDetailsId: () => {},
});

export { SubmissionModalContext };

type SubmissionModalProviderProps = {
  children: React.ReactNode;
};
const SubmissionModalProvider: React.FC<SubmissionModalProviderProps> = ({
  children,
}) => {
  const [shown, setShown] = useState<boolean>(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      setShown(false);
      setDetailsId(null);
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events, setShown]);

  return (
    <SubmissionModalContext.Provider
      value={{
        shown,
        setShown,
        challengeId,
        setChallengeId,
        detailsId,
        setDetailsId,
      }}
    >
      {children}
    </SubmissionModalContext.Provider>
  );
};

export default SubmissionModalProvider;
