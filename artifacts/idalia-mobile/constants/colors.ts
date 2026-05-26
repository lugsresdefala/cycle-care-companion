/**
 * IDALIA design tokens — synced with artifacts/idalia/src/index.css.
 * Palette derived from the IDALIA Calc logo: deep navy + amber + warm purple.
 */

const colors = {
  light: {
    text: "#0d1726",
    tint: "#133473",

    background: "#f5f6f8",
    foreground: "#0d1726",

    card: "#ffffff",
    cardForeground: "#0d1726",

    primary: "#133473",
    primaryForeground: "#ffffff",
    primaryLight: "#e1eafd",

    secondary: "#5a35ab",
    secondaryForeground: "#ffffff",
    secondaryLight: "#ece2f8",

    accent: "#ef8527",
    accentForeground: "#ffffff",
    accentLight: "#fbe6d5",

    destructive: "#cc3030",
    destructiveForeground: "#ffffff",

    muted: "#e4e8ee",
    mutedForeground: "#6a7892",

    border: "#d8dfeb",
    input: "#ebeef3",

    glass: "rgba(255,255,255,0.78)",
    glassBorder: "rgba(13,23,38,0.07)",
  },
  dark: {
    text: "#e8ebf2",
    tint: "#5f8bdb",

    background: "#0e1623",
    foreground: "#e8ebf2",

    card: "#161f30",
    cardForeground: "#e8ebf2",

    primary: "#5f8bdb",
    primaryForeground: "#0e1623",
    primaryLight: "#1b2a4a",

    secondary: "#a585d9",
    secondaryForeground: "#0e1623",
    secondaryLight: "#2a1e44",

    accent: "#f2914a",
    accentForeground: "#0e1623",
    accentLight: "#3a2918",

    destructive: "#e26060",
    destructiveForeground: "#ffffff",

    muted: "#1c2638",
    mutedForeground: "#8b97ad",

    border: "#2a3349",
    input: "#1c2638",

    glass: "rgba(22,31,48,0.78)",
    glassBorder: "rgba(232,235,242,0.08)",
  },
  radius: 14,
};

export default colors;
