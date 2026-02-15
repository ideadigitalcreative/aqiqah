/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--muted-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: "hsl(var(--gold-accent))",
        peach: "hsl(var(--peach))",
        brown: "hsl(var(--foreground))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        nav: "22px",
        btn: "20px",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'Nunito'", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.3)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "slide-up": "slide-up 0.8s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
      },
      backgroundImage: {
        "orange-gradient": "linear-gradient(to bottom, hsl(28 100% 74%), hsl(24 100% 65%), hsl(18 100% 59%))",
        "button-gradient": "linear-gradient(135deg, hsl(24 100% 65%), hsl(18 100% 59%))",
      },
      boxShadow: {
        soft: "0 4px 20px hsla(24, 60%, 50%, 0.12)",
        large: "0 8px 32px hsla(24, 60%, 50%, 0.16)",
        glow: "0 4px 24px hsla(24, 100%, 59%, 0.3)",
        footer: "0 -4px 20px hsla(24, 60%, 50%, 0.1)",
      },
    },
  },
  plugins: [],
}
