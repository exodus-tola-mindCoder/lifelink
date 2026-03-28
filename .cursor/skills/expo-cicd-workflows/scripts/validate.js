#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const SCHEMA_URL = "https://api.expo.dev/v2/workflows/schema";

function usage() {
  console.error("Usage: node validate.js <workflow.yml> [workflow2.yml ...]");
}

function loadYaml(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return YAML.parse(raw);
}

async function fetchSchema() {
  if (typeof fetch !== "function") {
    throw new Error("This script requires Node.js with global fetch support (Node 18+).");
  }

  const res = await fetch(SCHEMA_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch schema (${res.status}) from ${SCHEMA_URL}`);
  }
  return res.json();
}

function formatAjvError(err) {
  const instancePath = err.instancePath || "/";
  return `${instancePath}: ${err.message || "validation error"}`;
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    usage();
    process.exit(1);
  }

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      process.exit(1);
    }
  }

  const schema = await fetchSchema();
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateFormats: true
  });
  addFormats(ajv);

  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (error) {
    console.error("Failed to compile schema.");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  let hasErrors = false;

  for (const file of files) {
    const fullPath = path.resolve(file);
    let data;
    try {
      data = loadYaml(fullPath);
    } catch (error) {
      hasErrors = true;
      console.error(`\nFAIL ${file}`);
      console.error(`  Could not parse YAML: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    const ok = validate(data);
    if (ok) {
      console.log(`PASS ${file}`);
      continue;
    }

    hasErrors = true;
    console.error(`\nFAIL ${file}`);
    for (const err of validate.errors || []) {
      console.error(`  - ${formatAjvError(err)}`);
    }
  }

  if (hasErrors) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
