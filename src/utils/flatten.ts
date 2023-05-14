const flattenId = (id: string | string[] | undefined): string | undefined => {
  if (Array.isArray(id)) {
    return id[0];
  }
  return id;
};

const getSecond = (id: string | string[] | undefined): string | undefined => {
  if (Array.isArray(id)) {
    return id[1];
  }
  return undefined;
};

export { flattenId, getSecond };
