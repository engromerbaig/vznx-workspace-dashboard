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
        background: "#000000",
        dark:"#3B4136",
        foreground: "#000000",
        "primary": "#2B35A0",
        "secondary": "#B6B7BB",
        "scons": "#00C5FF",
        "borderColor": "ffff00 ",
        // Additional colors
        accent: "#FF4081",




        // no use colors for now
          'theme-blue': '#16B5B6',
                                'neon': '#16B5B6',


        'theme-dark': '#232323',
        'theme-light': '#FFFFFF',

        
                'heading-light': '#737373',
                        'heading-dark': '#fff',


        'dark-offcanvas':"#353535",
        'dark-hover':"#454545",
        'light-hover':"#F5F5F5",
        'body-text-light':"#737373",
        'body-text-dark':"#fff",
        'job-light':"#e5e7eb",
        'job-dark':"rgba(245, 245, 245,0.5)",
        
    
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