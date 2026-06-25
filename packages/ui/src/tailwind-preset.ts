// Tailwind preset mapping Project Alpha tokens into theme.extend.
// Web's tailwind.config.ts lists this under `presets`.
import type { Config } from "tailwindcss";
import { colors, fonts, radii } from "./tokens.js";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        bg: colors.bg,
        panel: colors.panel,
        panel2: colors.panel2,
        inset: colors.inset,
        fg: colors.fg,
        muted: colors.muted,
        faint: colors.faint,
        dim: colors.dim,
        gold: {
          DEFAULT: colors.gold,
          deep: colors.goldDeep,
          3: colors.gold3,
          2: colors.gold2,
          1: colors.gold1,
        },
        danger: colors.danger,
        success: colors.success,
        line: colors.line,
      },
      fontFamily: {
        // next/font sets --font-sans / --font-mono; literal names are the fallback.
        sans: [`var(--font-sans, ${fonts.sans})`],
        mono: [`var(--font-mono, ${fonts.mono})`],
      },
      borderRadius: {
        DEFAULT: radii.md,
        md: radii.md,
        lg: radii.lg,
        xl: radii.xl,
      },
      keyframes: {
        alphaFade: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        alphaFade: "alphaFade .3s ease",
      },
    },
  },
};

export default preset;
