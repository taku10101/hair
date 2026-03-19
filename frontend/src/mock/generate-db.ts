#!/usr/bin/env tsx
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateMockDataWithIds } from "./generators/base-generator";
import { generateComment, generatePost, generateUser } from "./generators/example-generators";
import type { DatabaseSchema } from "./types/base";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate mock database
 * Add your own generators here
 */
function generateDatabase(): DatabaseSchema {
  return {
    users: generateMockDataWithIds(generateUser, { count: 10 }),
    posts: generateMockDataWithIds(generatePost, { count: 20 }),
    comments: generateMockDataWithIds(generateComment, { count: 50 }),
  };
}

/**
 * Main function
 */
function main() {
  const db = generateDatabase();
  const outputPath = resolve(__dirname, "data", "db.json");

  writeFileSync(outputPath, JSON.stringify(db, null, 2), "utf-8");
  for (const [_key, _value] of Object.entries(db)) {
  }
}

main();
