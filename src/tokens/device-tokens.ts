export type devicename = "desktop" | "tablet" | "mobile";

export type devicetokenset = Record<string, string>;

export const devicetokens: Record<devicename, devicetokenset> = {
  desktop: {
    "h1 - font": "h1 - font - desktop",
    "h2 - font": "h2 - font - desktop",
    "h3 - font": "h3 - font - desktop",
    "l - font": "l - font - desktop",
    "m - font": "m - font - desktop",
    "s - font": "s - font - desktop",
    "xxxl - spacer": "space-20",
    "xxl - spacer": "space-10",
    "xl - spacer": "space-5",
    "l - spacer": "space-2.5",
    "m - spacer": "space-1.25",
    "s - spacer": "space-0.75",
    "xs - spacer": "space-0.25",
    "l - border - radius": "l - border - radius - desktop",
    "m - border - radius": "m - border - radius - desktop",
    "s - border - radius": "s - border - radius - desktop"
  },
  tablet: {
    "h1 - font": "h1 - font - tablet",
    "h2 - font": "h2 - font - tablet",
    "h3 - font": "h3 - font - tablet",
    "l - font": "l - font - tablet",
    "m - font": "m - font - tablet",
    "s - font": "s - font - tablet",
    "xxxl - spacer": "space-24",
    "xxl - spacer": "space-12",
    "xl - spacer": "space-6",
    "l - spacer": "space-3",
    "m - spacer": "space-1.5",
    "s - spacer": "space-1",
    "xs - spacer": "space-0.5",
    "l - border - radius": "l - border - radius - tablet",
    "m - border - radius": "m - border - radius - tablet",
    "s - border - radius": "s - border - radius - tablet"
  },
  mobile: {
    "h1 - font": "h1 - font - mobile",
    "h2 - font": "h2 - font - mobile",
    "h3 - font": "h3 - font - mobile",
    "l - font": "l - font - mobile",
    "m - font": "m - font - mobile",
    "s - font": "s - font - mobile",
    "xxxl - spacer": "space-32",
    "xxl - spacer": "space-16",
    "xl - spacer": "space-8",
    "l - spacer": "space-4",
    "m - spacer": "space-2",
    "s - spacer": "space-1",
    "xs - spacer": "space-0.5",
    "l - border - radius": "l - border - radius - mobile",
    "m - border - radius": "m - border - radius - mobile",
    "s - border - radius": "s - border - radius - mobile"
  }
};
