/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        // Brand palette (3-5 colors, no gradients)
        ink: "#1a1a1a", // primary dark text / footer
        charcoal: "#2b2b2b",
        brand: "#c79a3f", // gold accent (buttons / highlights)
        brandDark: "#a97f2b",
        olive: "#5a5232", // about section dark olive
        cream: "#f5f2ec", // section background
        line: "#e7e2d8", // borders
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 18px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
