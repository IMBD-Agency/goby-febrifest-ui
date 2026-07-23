/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./frontend/**/*.js"],
  theme: {
    extend: {
      colors: {
        brand: "var(--ColorPrimary)",
        "brand-alpha": "var(--ColorPrimaryAlpha)",
        "brand-banner": "var(--ColorPrimaryBanner)",
        "light-primary": "var(--ColorLightPrimary)",
        "dark-primary": "var(--ColorDarkPrimary)",
        "dark-secondary": "var(--ColorDarkSecondary)",
        line: "rgb(var(--ColorLightSecondaryRGB))",
      },
      fontFamily: {
        sans: ["var(--FontPrimary)", "sans-serif"],
        accent: ["'Great Vibes'", "cursive"],
      },
      boxShadow: {
        card: "var(--BoxShadow)",
        "card-hover": "var(--BoxShadowHover)",
      },
      fontSize: {
        "ultra-small": "var(--FontSizeUltraSmall)",
        "extra-small": "var(--FontSizeExtraSmall)",
        small: "var(--FontSizeSmall)",
        normal: "var(--FontSizeNormal)",
        large: "var(--FontSizeLarge)",
        "extra-large": "var(--FontSizeExtraLarge)",
        "ultra-large": "var(--FontSizeUltraLarge)",
      },
    },
    container: {
      center: true,
      padding: "0.75rem",
      screens: {
        sm: "540px",
        md: "720px",
        lg: "960px",
        xl: "1140px",
        "2xl": "1320px",
      },
    },
  },
  plugins: [],
};
