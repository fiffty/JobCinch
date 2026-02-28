import { chromium } from "playwright";
import { cleanUpHtml } from "../src/lib/cleanUpHtml";

const url = process.argv[2];

if (!url) {
  console.error("Usage: bun run scrape <url>");
  process.exit(1);
}

try {
  new URL(url);
} catch {
  console.error(`Invalid URL: ${url}`);
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const html = await page.content();
  const cleaned = cleanUpHtml(html);
  console.log(cleaned);
} finally {
  await browser.close();
}
