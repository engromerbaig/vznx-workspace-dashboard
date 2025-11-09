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
        // Main theme colors
        background: "#ffffff",
        foreground: "#000000",
        "primary": "#04A8F6",
        "secondary": "#B6B7BB",
        "scons": "#00C5FF",
        
    
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco"],
      },
      screens: {
        sm: "640px",
        // => @media (min-width: 640px) { ... }
        
        md: "768px",
        // for tablets
        // => @media (min-width: 768px) { ... }
        
        lg: "1025px",
        // => @media (min-width: 1024px) { ... }
        // using for laptops and desktop
        
        xl: "1280px",
        // => @media (min-width: 1280px) { ... }
        
        "2xl": "1536px",
        // => @media (min-width: 1536px) { ... }
      },
    },
  },
  plugins: [],
};

export default config;