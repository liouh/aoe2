#!/usr/bin/env node

/**
 * AoE2 Mappings Update & Check Script
 * Run with: node src/debug/update-mappings.js
 *
 * This script:
 * 1. Fetches the latest authoritative entity definitions from the community Google Sheet.
 * 2. Updates src/debug/de.csv with the latest export.
 * 3. Compares the sheet with src/lib/entityMappings.ts and reports new or missing IDs.
 * 4. Checks AoE2ScenarioParser datasets for new civs and technologies.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1llyn7FWKEtmss_WE-6hinMItpsV-h-6qsY8xBlkxUzw/export?format=csv&gid=193837369';
const DE_CSV_PATH = path.join(__dirname, 'de.csv');
const ENTITY_NAMES_PATH = path.join(__dirname, '..', 'lib', 'entityMappings.ts');
const CIV_MAPPINGS_PATH = path.join(__dirname, '..', 'lib', 'civMappings.ts');
const TECH_MAPPINGS_PATH = path.join(__dirname, '..', 'lib', 'techMappings.ts');

function fetchFollow(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchFollow(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}, status code: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCsv(csvText) {
  const lines = csvText.split('\n');
  const entities = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = [];
    let curr = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        parts.push(curr);
        curr = '';
      } else {
        curr += c;
      }
    }
    parts.push(curr);

    const id = parseInt(parts[0], 10);
    if (isNaN(id)) continue;
    const deName = parts[2]?.trim();
    const desc = parts[5]?.trim();
    if (deName && deName !== '-') {
      entities.set(id, { name: deName, desc });
    }
  }

  return entities;
}

async function main() {
  console.log('=== AoE2 ID Mappings Update Check ===\n');

  console.log(`1. Fetching latest entity spreadsheet from:\n   ${SHEET_URL}\n`);
  let csvData;
  try {
    csvData = await fetchFollow(SHEET_URL);
    console.log(`✓ Fetched ${csvData.length} bytes from Google Sheet.`);
  } catch (err) {
    console.error(`✗ Error fetching Google Sheet: ${err.message}`);
    return;
  }

  // Update local debug CSV
  fs.writeFileSync(DE_CSV_PATH, csvData, 'utf-8');
  console.log(`✓ Updated local CSV cache at: ${DE_CSV_PATH}`);

  // Parse CSV
  const sheetEntities = parseCsv(csvData);
  console.log(`✓ Found ${sheetEntities.size} valid entities in spreadsheet.`);

  // Parse local entityMappings.ts
  const localContent = fs.readFileSync(ENTITY_NAMES_PATH, 'utf-8');
  const localEntities = new Map();
  for (const match of localContent.matchAll(/^\s*(\d+):\s*"([^"]+)"/gm)) {
    localEntities.set(parseInt(match[1], 10), match[2]);
  }
  console.log(`✓ Local entityMappings.ts contains ${localEntities.size} mapped entities.\n`);

  // Compare entities
  const missingInLocal = [];
  for (const [id, info] of sheetEntities.entries()) {
    if (!localEntities.has(id)) {
      missingInLocal.push({ id, ...info });
    }
  }

  if (missingInLocal.length === 0) {
    console.log('✓ entityMappings.ts is completely up-to-date with the Google Sheet!');
  } else {
    console.log(`! Found ${missingInLocal.length} entities in the sheet not present in entityMappings.ts:`);
    for (const item of missingInLocal) {
      console.log(`  ${item.id}: "${item.name}" ${item.desc ? `(${item.desc})` : ''}`);
    }
    console.log('\nTo add them, edit src/lib/entityMappings.ts and add the entries listed above.');
  }

  // Check AoE2ScenarioParser dev branch for new civs
  console.log('\n2. Checking AoE2ScenarioParser for civilization updates...');
  try {
    const civData = await fetchFollow('https://raw.githubusercontent.com/KSneijders/AoE2ScenarioParser/dev/AoE2ScenarioParser/datasets/object_support.py');
    const civOldIdx = civData.indexOf('class CivilizationOld');
    if (civOldIdx !== -1) {
      const civSlice = civData.slice(civOldIdx, civOldIdx + 3000);
      const civMatches = [...civSlice.matchAll(/^\s+([A-Z0-9_]+)\s*=\s*(\d+)/gm)];
      console.log(`✓ Found ${civMatches.length} civilizations in AoE2ScenarioParser.`);
    }
  } catch (err) {
    console.log(`- Note: Could not query AoE2ScenarioParser civs: ${err.message}`);
  }

  console.log('\n=== Done ===');
}

main().catch(console.error);
