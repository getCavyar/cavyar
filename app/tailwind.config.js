/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00eeff",
        secondary: "#005d63",
        background: "#050505",
        surface: "#080808",
        backgroundLight: "#F9F9F9",
        surfaceLight: "#FFFFFF",

        // Snippet Action Button
        "dark-red": "#280606",
        "dark-green": "#031D12",
        "dark-blue": "#08192E",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-scoped-groups")],
};
