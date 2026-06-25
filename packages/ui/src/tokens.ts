// Project Alpha design tokens — single source for colors/fonts/radii.
// Web consumes via the Tailwind preset; mobile (NativeWind) can reuse the same values.

export const colors = {
  // surfaces
  bg: "#08080a", // near-black app background
  panel: "#101012", // card / panel
  panel2: "#0c0c0e", // secondary panel / sidebar
  inset: "#0a0a0c", // inputs / wells

  // text
  fg: "#ededed",
  muted: "#9a9aa0",
  faint: "#7a7a80",
  dim: "#5a5a60",

  // accent (gold) + ramp used by heatmap/score states
  gold: "#d4a24e",
  goldDeep: "#a07d2c",
  gold3: "#8a6a26",
  gold2: "#4a3a1c",
  gold1: "#2a2418",

  // status
  danger: "#e06a5a",
  success: "#7fbf7f",

  // hairline borders
  line: "rgba(255,255,255,0.07)",
  line2: "rgba(255,255,255,0.08)",
  goldLine: "rgba(212,162,78,0.25)",
} as const;

export const fonts = {
  sans: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const radii = {
  sm: "7px",
  md: "11px",
  lg: "14px",
  xl: "16px",
} as const;

export const tokens = { colors, fonts, radii } as const;
export type Tokens = typeof tokens;
