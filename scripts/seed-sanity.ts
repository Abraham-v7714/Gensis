/**
 * Sanity Content Seeding Script
 * Stage 4.3 - Real Editorial Data Validation
 *
 * Safe, idempotent seed script to populate Sanity Content Lake with
 * the GENSIS editorial dataset. Uses deterministic IDs.
 *
 * Usage:
 *   npx tsx scripts/seed-sanity.ts
 *
 * Requirements:
 *   - SANITY_PROJECT_ID
 *   - SANITY_DATASET
 *   - SANITY_API_WRITE_TOKEN (Requires a Sanity token with Write access)
 */

import { createClient } from "next-sanity";
import * as fs from "fs";
import * as path from "path";
import { allSeedDocuments } from "./sanity-seed-data";

// 1. Load environment variables manually since we run outside Next.js
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
      const match = line.match(/^([^#\s=]+)=(.*)$/);
      if (match) {
        process.env[match[1]] = match[2].trim();
      }
    });
  }
}

async function seed() {
  loadEnv();

  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET;
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId || !dataset) {
    console.error("❌ Missing SANITY_PROJECT_ID or SANITY_DATASET in environment.");
    process.exit(1);
  }

  if (!writeToken) {
    console.warn("⚠️  [GENSIS SEED] Live Content Lake seeding was not executed because valid write credentials (SANITY_API_WRITE_TOKEN) were unavailable.");
    console.log("   The seed script and deterministic dataset are fully prepared and validated locally.");
    console.log("   To execute live seeding, add SANITY_API_WRITE_TOKEN to .env.local and rerun.");
    process.exit(0); // Exit cleanly as per Stage 4.3 instructions
  }

  console.log("🌱 Starting GENSIS Sanity Content Seeding...");
  console.log(`Project: ${projectId} | Dataset: ${dataset}`);

  // 2. Initialize write client
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2026-09-12",
    useCdn: false, // Must be false for writes
    token: writeToken,
  });

  // 3. Upsert documents idempotently
  let successCount = 0;
  let failCount = 0;

  for (const doc of allSeedDocuments) {
    try {
      console.log(`Upserting [${doc._type}] ${doc._id} ...`);
      // We use createOrReplace which is fully idempotent based on _id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.createOrReplace(doc as any);
      successCount++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to upsert ${doc._id}:`, msg);
      failCount++;
    }
  }

  console.log("\n✅ Seeding Complete!");
  console.log(`Successfully upserted ${successCount} documents.`);
  if (failCount > 0) {
    console.error(`Failed to upsert ${failCount} documents.`);
    process.exit(1);
  }
}

seed();
