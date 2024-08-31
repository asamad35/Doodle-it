import type { Config } from "tailwindcss";
import { fillColors, strokeColors } from "./app/components/sideToolbar/helper";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  safelist: [
    "hover:border-violet-600",
    "hover:border-violet-300",
    "border-violet-600",
    "border-white",
    ...[...fillColors, ...strokeColors].map((color) => `bg-[${color}]`),
  ],
  plugins: [],
};
export default config;
