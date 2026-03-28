#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node fetch.js <url>");
    process.exit(1);
  }

  const scriptDir = __dirname;
  const cacheDir = path.join(scriptDir, ".cache");
  fs.mkdirSync(cacheDir, { recursive: true });

  const key = crypto.createHash("sha256").update(url).digest("hex");
  const bodyPath = path.join(cacheDir, `${key}.body`);
  const metaPath = path.join(cacheDir, `${key}.json`);

  let meta = {};
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch {
      meta = {};
    }
  }

  const headers = {};
  if (meta.etag) {
    headers["If-None-Match"] = meta.etag;
  }

  if (typeof fetch !== "function") {
    console.error("This script requires Node.js with global fetch support (Node 18+).");
    process.exit(1);
  }

  const response = await fetch(url, { headers });

  if (response.status === 304 && fs.existsSync(bodyPath)) {
    const cached = fs.readFileSync(bodyPath, "utf8");
    console.error(`Not modified (304). Using cached response for: ${url}`);
    process.stdout.write(cached);
    return;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`Failed to fetch ${url} (status ${response.status})`);
    if (text) {
      console.error(text.slice(0, 1000));
    }
    process.exit(1);
  }

  const text = await response.text();
  const etag = response.headers.get("etag") || null;

  fs.writeFileSync(bodyPath, text, "utf8");
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        url,
        etag,
        fetchedAt: new Date().toISOString()
      },
      null,
      2
    ),
    "utf8"
  );

  console.error(`Fetched ${url} and updated cache.`);
  process.stdout.write(text);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
