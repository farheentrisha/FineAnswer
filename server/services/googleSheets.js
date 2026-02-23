const { google } = require("googleapis");

// Load service account credentials directly (file is gitignored)
const credentials = require("../fineanswer-sheets-integration-36cfd2d82769.json");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

// Extract the raw spreadsheet ID from a full URL or bare ID
function extractSpreadsheetId(raw) {
  if (!raw) return null;
  // Handle full Google Sheets URL like:
  // https://docs.google.com/spreadsheets/d/ID/edit?gid=...
  const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // Otherwise assume it's already a bare ID
  return raw.trim();
}

const SPREADSHEET_ID = extractSpreadsheetId(process.env.GOOGLE_SPREADSHEET_ID);

// In-memory cache: { data: [...], expiresAt: timestamp }
let cache = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Detect if a row is a "category" row:
 * Only the first cell has a value; all other cells are empty.
 */
function isCategoryRow(row) {
  if (!row || row.length === 0) return false;
  const first = (row[0] || "").toString().trim();
  if (!first) return false;
  // Every cell after index 0 must be blank
  for (let i = 1; i < row.length; i++) {
    if ((row[i] || "").toString().trim() !== "") return false;
  }
  return true;
}

/**
 * Parse all programs from one sheet tab.
 * @param {string[][]} rows  - Raw 2D array from the Sheets API
 * @param {string}     sheet - Tab name (used only for logging)
 * @returns {object[]}
 */
function parseSheetRows(rows, sheet) {
  if (!rows || rows.length < 3) return [];

  // Row 1 (index 0): full university/college name
  const university = (rows[0][0] || "").toString().trim() || sheet;

  // Row 2 (index 1): column headers – we skip this

  const programs = [];
  let currentLevel = "";

  // Start from row index 2 (row 3 in the sheet)
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];

    // Skip entirely blank rows
    if (!row || row.every((cell) => (cell || "").toString().trim() === "")) {
      continue;
    }

    if (isCategoryRow(row)) {
      // This row is a level label (e.g. "Master's (Postgraduate)")
      currentLevel = (row[0] || "").toString().trim();
      continue;
    }

    const programName = (row[2] || "").toString().trim();
    if (!programName) continue; // Skip rows with no program name

    programs.push({
      university,
      campus: (row[0] || "").toString().trim(),
      referenceLink: (row[1] || "").toString().trim(),
      programName,
      nfqQqi: (row[3] || "").toString().trim(),
      availableIntakes: (row[4] || "").toString().trim(),
      duration: (row[5] || "").toString().trim(),
      tuitionFees: (row[6] || "").toString().trim(),
      englishRequirements: (row[7] || "").toString().trim(),
      academicRequirements: (row[8] || "").toString().trim(),
      level: currentLevel,
      country: "Ireland",
    });
  }

  return programs;
}

/**
 * Fetch all programs from every tab of the spreadsheet.
 * Results are cached in memory for CACHE_TTL_MS.
 * @returns {Promise<object[]>}
 */
async function getAllPrograms() {
  // Return cached data if still valid
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error("GOOGLE_SPREADSHEET_ID is not set in environment variables.");
  }

  // Fetch the spreadsheet metadata to get all sheet (tab) names
  const metaRes = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheetNames = metaRes.data.sheets.map((s) => s.properties.title);

  // Build batch ranges: fetch every tab at once
  const ranges = sheetNames.map((name) => `'${name}'`);

  const batchRes = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges,
    valueRenderOption: "FORMATTED_VALUE",
  });

  const allPrograms = [];

  (batchRes.data.valueRanges || []).forEach((valueRange, idx) => {
    const sheetName = sheetNames[idx];
    const rows = valueRange.values || [];
    const parsed = parseSheetRows(rows, sheetName);
    allPrograms.push(...parsed);
  });

  // Store in cache
  cache = { data: allPrograms, expiresAt: Date.now() + CACHE_TTL_MS };

  return allPrograms;
}

module.exports = { getAllPrograms };
