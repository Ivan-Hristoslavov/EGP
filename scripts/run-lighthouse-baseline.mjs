#!/usr/bin/env node
/**
 * Mobile Lighthouse JSON baseline for regression checks.
 *
 * Usage:
 *   LIGHTHOUSE_URL=https://example.com npm run lighthouse:baseline
 *
 * Requires Chrome/Chromium. Override binary:
 *   CHROME_PATH=/path/to/chrome npm run lighthouse:baseline
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

function resolveChromePath() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates =
    process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
        ]
      : [
          "/usr/bin/google-chrome-stable",
          "/usr/bin/google-chrome",
          "/usr/bin/chromium",
        ];

  return candidates.find((p) => existsSync(p)) ?? null;
}

const url =
  process.env.LIGHTHOUSE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://egpaesthetics.co.uk";

const outDir = join(repoRoot, "reports");

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const outJson = join(outDir, "lighthouse-baseline-mobile.json");
const summaryPath = join(outDir, "lighthouse-baseline-summary.txt");

const escapedUrl = url.replace(/'/g, "'\\''");
const chromePath = resolveChromePath();
const chromeArg = chromePath
  ? ` --chrome-path='${chromePath.replace(/'/g, "'\\''")}'`
  : "";

let cmd = `npx --yes lighthouse@11.7.1 '${escapedUrl}'${chromeArg} --only-categories=performance --form-factor=mobile --screenEmulation.mobile=true --output=json --output-path=${outJson} --quiet`;

try {
  execSync(cmd, { cwd: repoRoot, stdio: "inherit", shell: "/bin/sh" });
} catch {
  const hint = [
    "Lighthouse failed (often: Chrome not installed or not found).",
    "",
    `target URL: ${url}`,
    "",
    "Fix:",
    "  - Install Google Chrome, or set CHROME_PATH to your Chromium/Chrome binary.",
    "",
    `attempted command:\n  ${cmd}`,
    "",
  ].join("\n");

  writeFileSync(summaryPath, hint, "utf8");
  console.error(hint);
  process.exit(1);
}

const raw = JSON.parse(readFileSync(outJson, "utf8"));

const perf = raw.categories?.performance?.score;
const audits = raw.audits || {};
const lines = [
  `url: ${url}`,
  `generatedAt: ${raw.fetchTime || ""}`,
  `performanceScore: ${perf != null ? Math.round(perf * 100) : "n/a"}`,
  `first-contentful-paint: ${audits["first-contentful-paint"]?.displayValue ?? "n/a"}`,
  `largest-contentful-paint: ${audits["largest-contentful-paint"]?.displayValue ?? "n/a"}`,
  `total-blocking-time: ${audits["total-blocking-time"]?.displayValue ?? "n/a"}`,
  `cumulative-layout-shift: ${audits["cumulative-layout-shift"]?.displayValue ?? "n/a"}`,
  `server-response-time: ${audits["server-response-time"]?.displayValue ?? "n/a"}`,
  `interactive: ${audits["interactive"]?.displayValue ?? "n/a"}`,
  "",
  `full JSON: ${outJson}`,
];

writeFileSync(summaryPath, lines.join("\n"), "utf8");
console.log(`\nWrote ${summaryPath}`);
