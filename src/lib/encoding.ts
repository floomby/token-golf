const isBrowser = () => {
  return typeof window !== "undefined";
};

const base64Encode = (value: string) => {
  if (!value) {
    return null;
  }

  const valueToString = value.toString();

  if (isBrowser()) {
    return window.btoa(valueToString);
  }

  const buff = Buffer.from(valueToString, "ascii");
  return buff.toString("base64");
};

const base64Decode = (value: string) => {
  if (!value) {
    return null;
  }

  const valueToString = value.toString();

  if (isBrowser()) {
    return window.atob(valueToString);
  }

  const buff = Buffer.from(valueToString, "base64");
  return buff.toString("ascii");
};

export { base64Encode, base64Decode, isBrowser };
