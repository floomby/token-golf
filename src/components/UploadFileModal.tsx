// The level of jank in this file is almost as bad as in the backend code for this

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { colorFromFeedbackLevel, FeedbackLevel } from "../lib/feedback";

type UploadFileModalProps = {
  shown: boolean;
  hide: () => void;
  endpoint: string;
  validator: (filename: string) => string | null;
};
const UploadFileModal: React.FC<UploadFileModalProps> = ({
  shown,
  hide,
  endpoint,
  validator,
}) => {
  const endpointString = useMemo(() => {
    if (endpoint.includes("?")) {
      return endpoint + "&";
    }
    return endpoint + "?";
  }, [endpoint]);

  const [filename, setFilename] = useState<string>("");

  const [validationResult, setValidationResult] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 1, transition: { duration: 0.2 } }}
          className="fixed top-0 left-0 z-50 flex min-h-full w-full flex-col items-center justify-center overflow-y-auto bg-black bg-opacity-50"
        >
          <div
            className={
              "min-w-1/2 m-2 flex h-fit flex-col items-center justify-center rounded-2xl px-0 pt-1 shadow-lg " +
              "overflow-y-auto border-2 border-teal-500 bg-stone-300 dark:bg-stone-800"
            }
          >
            <div className="m-4 flex flex-col items-center justify-center gap-2">
              <input
                type="file"
                id="uploadFileInput"
                className="m-2 rounded bg-stone-200 p-0 px-4 py-2 dark:bg-stone-700"
                onChange={(e) => {
                  const name = (e.target.files?.[0]?.name ?? "").toString();
                  setFilename(name);
                  setValidationResult(name === "" ? null : validator(name));
                }}
              />
              {!!validationResult && (
                <h2 className="text-md font-bold text-teal-500">
                  {validationResult}
                </h2>
              )}
              <div className="m-2 flex flex-row items-center justify-center gap-2">
                <button
                  className={
                    "rounded px-4 py-2 font-semibold" +
                    colorFromFeedbackLevel(FeedbackLevel.Primary, true)
                  }
                  onClick={() => {
                    setFilename("");
                    setValidationResult(null);
                    hide();
                  }}
                >
                  Cancel
                </button>
                <button
                  className={
                    "rounded px-4 py-2 font-semibold" +
                    colorFromFeedbackLevel(FeedbackLevel.Success, true)
                  }
                  onClick={() => {
                    const file = (
                      document.getElementById(
                        "uploadFileInput"
                      ) as HTMLInputElement | null
                    )?.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append("file", file);
                      void fetch(endpointString + "filename=" + filename, {
                        method: "POST",
                        body: formData,
                      }).then(() => {
                        setFilename("");
                        setValidationResult(null);
                        hide();
                      });
                    }
                  }}
                  disabled={filename === "" || !!validationResult}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadFileModal;
