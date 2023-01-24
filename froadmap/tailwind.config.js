const theme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  darkMode: "class", //https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually
  theme: {
    fontFamily: {
      sansSerif: theme.fontFamily.sans,
      marker: ["Permanent Marker", ...theme.fontFamily.sans],
    },
    extend: {
      screen: {
        retina: "300dpi",
      },
      gridTemplateColumns: {
        features:
          "2rem minmax(0, 6fr) repeat(2, minmax(0, 4fr)) minmax(9rem, var(--scoreWidthToggleWithPriority)) minmax(5rem, var(--scoreWidthToggleWithHelp)) minmax(0, 4fr)",
      },
      colors: {
        app: "#03bfc6",
      },
      accent: {
        app: "#03bfc6",
      },
      borderColor: {
        DEFAULT: "#000",
      },
      aspectRatio: {
        link: "auto 480 / 250",
      },
      height: {
        "screen-4/5": "80vh",
        "screen-1/2": "50vh",
      },
      minHeight: {
        "screen-1/2": "50vh",
      },
    },
  },
  variants: {},
  plugins: [
    require("@tailwindcss/line-clamp"),
    function ({ addVariant }) {
      addVariant("child", "& > *");
      addVariant("child-hover", "& > *:hover");
    },
  ],
};
