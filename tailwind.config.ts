import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                    50: "#fdf2f3",
                    100: "#fbe6e7",
                    200: "#f6ced1",
                    300: "#efa4a8",
                    400: "#e57077",
                    500: "#d7454e",
                    600: "#c02933",
                    700: "#a01d26",
                    800: "#88040b", // Spada Burgundy
                    900: "#74080e",
                    950: "#410003",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                    50: "#fbfaf9",
                    100: "#f7f5f3",
                    200: "#ece8e4", // Spada Beige Light
                    300: "#e8e4df", // Spada Beige Base
                    400: "#d4cec5",
                    500: "#b9afa2",
                    600: "#9e9183",
                    700: "#7f7267",
                    800: "#695e55",
                    900: "#554d47",
                    950: "#2d2926",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Monday.com Status Colors
                status: {
                    done: "#00C875",      // Green
                    working: "#FDAB3D",   // Orange/Yellow
                    stuck: "#E2445C",     // Red
                    empty: "#C4C4C4",     // Grey
                    purple: "#A25DDC",    // Purple
                    blue: "#0086C0",      // Blue
                }
            },
            fontFamily: {
                sans: ["Outfit", "Rubik", "Heebo", "system-ui", "sans-serif"],
                display: ["Rubik", "system-ui", "sans-serif"],
                serif: ["serif"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                pill: "9999px", // Lunair buttons
                "4xl": "2.5rem",
                "5xl": "3rem",
            },
            boxShadow: {
                "soft": "0 4px 20px -2px rgba(93, 112, 82, 0.15)", // Moss tinted
                "float": "0 10px 40px -10px rgba(193, 140, 93, 0.2)", // Clay tinted
                "deep": "0 20px 40px -10px rgba(93, 112, 82, 0.15)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
                "scale-in": "scaleIn 0.3s ease-out",
                "float": "float 6s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.9)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
