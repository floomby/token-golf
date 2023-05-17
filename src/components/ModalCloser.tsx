import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { SubmissionModalContext } from "~/providers/submissionModal";

const ModalCloser: React.FC = () => {
  const { setShown } = useContext(SubmissionModalContext);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => setShown(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events, setShown]);

  return null;
};

export default ModalCloser;
