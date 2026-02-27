export type colormode = "light" | "dark";

export const colorvariables: Record<colormode, Record<string, string>> = {
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
