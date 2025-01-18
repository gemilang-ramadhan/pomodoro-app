/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{html,js}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                darkBg: "#1F2937",
                darkCard: "#374151",
                primary: "#4F46E5",
                secondary: "#F59E0B",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "scale(0.9)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                fadeOut: {
                    "0%": { opacity: "1", transform: "scale(1)" },
                    "100%": { opacity: "0", transform: "scale(0.9)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 0.3s forwards",
                fadeOut: "fadeOut 0.3s forwards",
            },
        },
    },
    plugins: [],
};
