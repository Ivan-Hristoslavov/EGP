/**
 * Shared email theme: Montserrat font, light default (#f5f1e9), dark mode (green #2d322c).
 * Use getEmailHead() in all templates and same structure for consistent design.
 */

export const EMAIL = {
  font: "Montserrat, Georgia, -apple-system, BlinkMacSystemFont, sans-serif",
  // Light theme
  light: {
    bg: "#f5f1e9",
    wrap: "#ffffff",
    text: "#1c1917",
    textMuted: "#2d2a26",
    muted: "#78716c",
    green: "#464C45",
    greenDark: "#3a4039",
    accent: "#c9c1b0",
    cardBg: "#f5f1e9",
    cardBorder: "#ddd5c3",
    noticeBorder: "#464C45",
    link: "#464C45",
    deposit: "#2d6a4f",
    danger: "#b91c1c",
  },
  // Dark theme (prefers-color-scheme: dark)
  dark: {
    bg: "#2d322c",
    wrap: "#3a4039",
    text: "#e7e4df",
    textMuted: "#d6d3ce",
    muted: "#a8a29e",
    green: "#5a6259",
    greenDark: "#464C45",
    accent: "#9d9585",
    cardBg: "#3a4039",
    cardBorder: "#4a5249",
    noticeBorder: "#5a6259",
    link: "#c9c1b0",
    deposit: "#4ade80",
    danger: "#f87171",
  },
} as const;

/** Head block: charset, viewport, Montserrat font, color-scheme, dark mode overrides */
export function getEmailHead(): string {
  return `
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  body { font-family: ${EMAIL.font}; }
  @media (prefers-color-scheme: dark) {
    body.email-body { background: ${EMAIL.dark.bg} !important; color: ${EMAIL.dark.text} !important; }
    .email-wrap { background: ${EMAIL.dark.wrap} !important; color: ${EMAIL.dark.text} !important; }
    .email-header { background: ${EMAIL.dark.greenDark} !important; color: ${EMAIL.dark.text} !important; }
    .email-header p, .email-header span { color: ${EMAIL.dark.textMuted} !important; }
    .email-card { background: ${EMAIL.dark.cardBg} !important; border-color: ${EMAIL.dark.cardBorder} !important; color: ${EMAIL.dark.text} !important; }
    .email-card-title { color: ${EMAIL.dark.green} !important; }
    .email-footer { background: ${EMAIL.dark.wrap} !important; border-color: ${EMAIL.dark.cardBorder} !important; color: ${EMAIL.dark.muted} !important; }
    .email-notice { border-left-color: ${EMAIL.dark.noticeBorder} !important; }
    .email-link { color: ${EMAIL.dark.link} !important; }
    .email-accent-bar { background: ${EMAIL.dark.accent} !important; }
    .email-badge { background: ${EMAIL.dark.green} !important; color: ${EMAIL.dark.text} !important; }
    a { color: ${EMAIL.dark.link} !important; }
  }
</style>
`.trim();
}
