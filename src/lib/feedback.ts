// This file is a collection of miscellaneous things that are reused but don't have a proper home.

import { createContext } from "react";

enum FeedbackLevel {
  Success = "success",
  Warning = "warning",
  Error = "error",
  Info = "info",
  Primary = "primary",
  Secondary = "secondary",
}

type ThemeOverride = "light" | "dark" | null;

// I do this a dumb way because I am lazy (Idk how robust this actually is)
// dark theme override has a strange bug (it has something to do with css classes not being applied (something is purging them or something))
const themeOverrider = (
  classNames: string,
  themeOverride: ThemeOverride
): string => {
  if (themeOverride === null) {
    return classNames;
  }
  const classes = classNames.split(" ");
  if (themeOverride === "light") {
    return " " + classes.filter((c) => !c.includes("dark:")).join(" ");
  }
  // return classNames;
  // console.log(
  //   classes
  //     .filter((c) => c.includes("dark:"))
  //     .map((c) => c.replace("dark:", ""))
  //     .join(" ")
  //   );
  return (
    " " +
    classes
      .filter((c) => c.includes("dark:"))
      .map((c) => c.replace("dark:", ""))
      .join(" ")
  );
};

const colorFromFeedbackLevel = (
  level: FeedbackLevel,
  hoverable = false,
  themeOverride: ThemeOverride = null
): string => {
  switch (level) {
    case FeedbackLevel.Success:
      return themeOverrider(
        " bg-green-700 text-white dark:bg-green-400 dark:text-black disabled:bg-green-300 dark:disabled:bg-green-100 disabled:text-gray-300 dark:disabled:text-gray-700 " +
          (hoverable ? " hover:bg-green-600 dark:hover:bg-green-300" : ""),
        themeOverride
      );
    case FeedbackLevel.Error:
      return themeOverrider(
        " bg-red-700 text-white dark:bg-red-400 dark:text-black disabled:bg-red-500 dark:disabled:bg-red-200 disabled:text-gray-300 dark:disabled:text-gray-700 " +
          (hoverable ? " hover:bg-red-600 dark:hover:bg-red-300" : ""),
        themeOverride
      );
    case FeedbackLevel.Warning:
      return themeOverrider(
        " bg-yellow-500 text-white dark:bg-yellow-400 dark:text-black disabled:bg-yellow-500 disabled:text-gray-300 dark:disabled:text-gray-700 " +
          (hoverable ? " hover:bg-yellow-600 dark:hover:bg-yellow-300" : ""),
        themeOverride
      );
    case FeedbackLevel.Info:
      return themeOverrider(
        " bg-gray-700 text-white dark:bg-gray-400 dark:text-black disabled:bg-gray-500 dark:disabled:bg-gray-200 disabled:text-gray-300 dark:disabled:text-gray-700 " +
          (hoverable ? " hover:bg-gray-600 dark:hover:bg-gray-300" : ""),
        themeOverride
      );
    case FeedbackLevel.Primary:
      return themeOverrider(
        " bg-blue-700 text-white dark:bg-blue-400 dark:text-black disabled:bg-stone-500 dark:disabled:bg-stone-200 disabled:text-gray-300 dark:disabled:text-gray-700 " +
          (hoverable ? " hover:bg-blue-600 dark:hover:bg-blue-300" : ""),
        themeOverride
      );
    case FeedbackLevel.Secondary:
      return themeOverrider(
        " bg-slate-700 text-white dark:bg-slate-400 dark:text-black disabled:bg-slate-500 dark:disabled:bg-slate-200 disabled:text-gray-300 dark:disabled:text-gray-700 " +
          (hoverable ? " hover:bg-slate-600 dark:hover:bg-slate-300" : ""),
        themeOverride
      );
  }
};

const ThemeContext = createContext<{
  theme: string;
  setTheme: (changeTo: string) => void;
}>({
  theme: "light",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setTheme: () => {},
});

export { FeedbackLevel, colorFromFeedbackLevel, ThemeContext };
