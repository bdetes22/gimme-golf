import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#060A07",
        green: {
          accent: "#3DB86B",
        },
        gold: "#C8973A",
        cream: "#EAE6DC",
      },
    },
  },
  plugins: [],
};
export default config;
