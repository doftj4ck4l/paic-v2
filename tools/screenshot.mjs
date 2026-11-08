import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = new URL("../docs/screenshots/", import.meta.url).pathname;

mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "mobile", width: 390, height: 844 },
];

const FLOWS = [
  { id: "login", path: "/login", level: null, only: ["desktop", "tablet", "mobile"] },
  { id: "register", path: "/register", level: null, only: ["desktop"] },
  { id: "forgot", path: "/forgot-password", level: null, only: ["desktop"] },
  { id: "home", path: "/", level: "primary", only: ["desktop", "tablet", "mobile"] },
  { id: "pending", path: "/pending/buku-kerja", level: "primary", only: ["desktop"] },
];

const browser = await chromium.launch();
let count = 0;
const consoleErrors = [];

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[${viewport.name}] ${msg.text()}`);
  });

  for (const flow of FLOWS) {
    if (flow.only && !flow.only.includes(viewport.name)) continue;

    if (flow.level) {
      await context.addCookies([
        { name: "paicv3_demo_level", value: flow.level, url: BASE },
      ]);
    } else {
      await context.clearCookies();
    }

    await page.goto(`${BASE}${flow.path}`, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    await page.addStyleTag({
      content: "[data-nextjs-toast], nextjs-portal { display: none !important; }",
    });

    const file = `${OUT}${flow.id}-${viewport.name}.png`;
    await page.screenshot({ path: file, fullPage: viewport.name === "desktop" });
    count += 1;
    console.log(`✓ ${flow.id}-${viewport.name}.png`);
  }
  await context.close();
}

await browser.close();

if (consoleErrors.length) {
  console.log(`\n⚠ console errors:`);
  for (const e of consoleErrors.slice(0, 10)) console.log(`   ${e}`);
} else {
  console.log(`\nNo console errors.`);
}
console.log(`Done: ${count} screenshots → docs/screenshots/`);
