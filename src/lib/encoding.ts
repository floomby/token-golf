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

// look at the last bit of the last character of the string
const stringParity = (value: string) => {
  const lastChar = value[value.length - 1];
  const lastCharCode = lastChar!.charCodeAt(0);
  const lastBit = lastCharCode & 1;
  return lastBit;
};

export { base64Encode, base64Decode, isBrowser, stringParity };
