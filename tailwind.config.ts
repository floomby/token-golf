import { type Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "subtle-bounce": "subtle-bounce 1.9s ease-in-out infinite",
      },
      keyframes: {
        "subtle-bounce": {
          "0%, 50%, 100%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
          "25%": {
            transform: "translateY(-15%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "75%": {
            transform: "translateY(-5%)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },
      textShadow: {
        sm: "0 0px 2px var(--tw-shadow-color)",
        DEFAULT: "0 0px 4px var(--tw-shadow-color)",
        lg: "0 0px 8px var(--tw-shadow-color)",
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
  ],
} satisfies Config;
