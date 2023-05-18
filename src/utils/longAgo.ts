const longAgo = (date: Date | string) => {
  const now = new Date().getTime();
  const then = new Date(date).getTime();

  // print out X minutes ago, X hours ago, X days ago, X weeks ago, X months ago, or X years ago

  if (now - then < 60 * 1000) {
    return "a few seconds ago";
  }

  if (now - then < 60 * 60 * 1000) {
    const minutes = Math.floor((now - then) / (60 * 1000));
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (now - then < 24 * 60 * 60 * 1000) {
    const hours = Math.floor((now - then) / (60 * 60 * 1000));
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (now - then < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor((now - then) / (24 * 60 * 60 * 1000));
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  if (now - then < 30 * 24 * 60 * 60 * 1000) {
    const weeks = Math.floor((now - then) / (7 * 24 * 60 * 60 * 1000));
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  if (now - then < 365 * 24 * 60 * 60 * 1000) {
    const months = Math.floor((now - then) / (30 * 24 * 60 * 60 * 1000));
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor((now - then) / (365 * 24 * 60 * 60 * 1000));
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

export default longAgo;
