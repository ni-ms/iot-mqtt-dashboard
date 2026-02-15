const palette = {
  neutral100: "#121212", // Dark background
  neutral200: "#1E1E1E", // Surface
  neutral300: "#2C2C2C",
  neutral400: "#454545",
  neutral500: "#808080",
  neutral600: "#B3B3B3",
  neutral700: "#E0E0E0", // Text
  neutral800: "#FFFFFF", // High contrast text
  neutral900: "#000000",

  primary100: "#CCFBF1",
  primary200: "#99F6E4",
  primary300: "#5EEAD4",
  primary400: "#2DD4BF",
  primary500: "#14B8A6", // Teal/Cyan main
  primary600: "#0D9488",

  // secondary100: "#DCDDE9", // Original
  secondary100: "#fae8ff",
  secondary200: "#BCC0D6",
  secondary300: "#9196B9",
  secondary400: "#626894",
  secondary500: "#d946ef", // Fuchsia accent

  accent100: "#fef3c7",
  accent200: "#fde68a",
  accent300: "#fcd34d",
  accent400: "#fbbf24",
  accent500: "#f59e0b",

  angry100: "#fee2e2",
  angry500: "#ef4444",

  overlay20: "rgba(0, 0, 0, 0.2)",
  overlay50: "rgba(0, 0, 0, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.neutral100,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral500,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
} as const
