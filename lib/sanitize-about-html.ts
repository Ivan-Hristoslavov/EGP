import sanitizeHtml from "sanitize-html";

/**
 * Detect CMS content that is HTML (e.g. pasted from Word) vs plain text.
 */
export function aboutContentLooksLikeHtml(content: string): boolean {
  const t = content.trim();
  if (t.length < 3 || !t.includes("<")) return false;
  return /<\/[a-z][a-z0-9]*>|<[a-z][a-z0-9]*[\s/>]/i.test(t);
}

const ABOUT_SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "span",
    "div",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    "*": ["class", "style"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    a: ["http", "https", "mailto", "tel"],
  },
  // Allow common editorial inline styles (Word/CMS) without url() / expression
  allowedStyles: {
    "*": {
      "font-size": [
        /^\s*(?:\d+(?:\.\d+)?(?:px|em|rem|%|pt)|(?:x-)?small|(?:x-)?large|medium|larger|smaller|inherit|initial)\s*$/i,
      ],
      "font-weight": [/^\s*(?:bold|normal|bolder|lighter|\d{3})\s*$/i],
      "line-height": [/^\s*(?:\d+(?:\.\d+)?(?:px|em|rem|%)|normal)\s*$/i],
      "text-align": [/^\s*(?:left|right|center|justify)\s*$/i],
      color: [
        /^\s*#[0-9a-f]{3,8}\s*$/i,
        /^\s*rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)\s*$/i,
        /^\s*rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)\s*$/i,
      ],
    },
  },
};

/**
 * Sanitize admin-authored HTML for the public About page (no scripts / handlers).
 */
export function sanitizeAboutBodyHtml(html: string): string {
  return sanitizeHtml(html, ABOUT_SANITIZE);
}
