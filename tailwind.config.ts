// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: "#0F0A07",
          dark: "#1A110B",
          glass: "rgba(38, 24, 16, 0.75)", // Marrom escuro com transparência
          gold: "#D4AF37",
          goldLight: "#F3E5AB",
          goldDark: "#C59B27",
          text: "#F5F5F0",
          muted: "#A89F91",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C59B27 0%, #F3E5AB 50%, #D4AF37 100%)",
        "glass-gradient": "linear-gradient(180deg, rgba(38,24,16,0.8) 0%, rgba(15,10,7,0.9) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;