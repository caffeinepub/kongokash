/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        /* Brand colors */
        teal: {
          dark: "oklch(var(--teal-dark) / <alpha-value>)",
          medium: "oklch(var(--teal-medium) / <alpha-value>)",
        },
        "hero-green": "oklch(var(--hero-green) / <alpha-value>)",
        gold: "oklch(var(--gold) / <alpha-value>)",
        "orange-accent": "oklch(var(--orange-accent) / <alpha-value>)",
        cream: "oklch(var(--cream) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0 2px 12px oklch(0 0 0 / 0.08)",
        "card-lg": "0 8px 32px oklch(0 0 0 / 0.12)",
        gold: "0 4px 20px oklch(0.77 0.13 85 / 0.35)",
        teal: "0 4px 20px oklch(0.27 0.07 195 / 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
