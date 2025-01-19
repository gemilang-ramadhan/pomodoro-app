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
            "0%": { opacity: "0", transform: "translateY(-10px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
          fadeOut: {
            "0%": { opacity: "1", transform: "translateY(0)" },
            "100%": { opacity: "0", transform: "translateY(-10px)" },
          },
          slideDown: {
            "0%": { opacity: 0, transform: "translateY(-20px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
          swipeLeft: {
            "0%": { opacity: 1, transform: "translateX(0)" },
            "100%": { opacity: 0, transform: "translateX(-100%)" },
          },
        },
        animation: {
          fadeIn: "fadeIn 0.5s ease-out forwards",
          fadeOut: "fadeOut 0.3s ease-in forwards",
          slideDown: "slideDown 0.2s ease-out forwards",
          swipeLeft: "swipeLeft 0.2s ease-in forwards",
        },
      },
    },
    plugins: [require("tailwind-scrollbar")],
  };
  