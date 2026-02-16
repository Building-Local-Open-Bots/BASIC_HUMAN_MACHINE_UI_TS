export type ColorMode = "light" | "dark";

export const colorVariables: Record<ColorMode, Record<string, string>> = {
  light: {
    "primary": "primary - light",
    "secondary": "secondary - light",
    "background": "background - light"
  },
  dark: {
    "primary": "primary - dark",
    "secondary": "secondary - dark",
    "background": "background - dark"
  }
};
