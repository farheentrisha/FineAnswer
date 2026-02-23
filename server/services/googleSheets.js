const { google } = require("googleapis");

// Load service account credentials directly (file is gitignored)
const credentials = require("../fineanswer-sheets-integration-c29908b1decf.json");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

// Extract the raw spreadsheet ID from a full URL or bare ID
function extractSpreadsheetId(raw) {
  if (!raw) return null;
  const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return raw.trim();
}

const SPREADSHEET_ID = extractSpreadsheetId(process.env.GOOGLE_SPREADSHEET_ID);

// In-memory cache
let cache = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Level Normalisation ──────────────────────────────────────────────────────
// The sheet uses many label variants for the same level. Map them all to the
// four canonical values that the frontend dropdown exposes.
const LEVEL_CANON = {
  "master's (postgraduate)": "Master's (Postgraduate)",
  "master's":                "Master's (Postgraduate)",
  "masters":                 "Master's (Postgraduate)",
  "postgraduate":            "Master's (Postgraduate)",
  "master of":               "Master's (Postgraduate)",   // prefix match handled below
  "msc":                     "Master's (Postgraduate)",
  "ma ":                     "Master's (Postgraduate)",
  "mba":                     "Master's (Postgraduate)",

  "bachelor's (undergraduate)": "Bachelor's (Undergraduate)",
  "bachelor's":                 "Bachelor's (Undergraduate)",
  "bachelors":                  "Bachelor's (Undergraduate)",
  "undergraduate":              "Bachelor's (Undergraduate)",
  "bachelor of":                "Bachelor's (Undergraduate)",

  "postgraduate diploma": "Postgraduate Diploma",
  "post graduate diploma":"Postgraduate Diploma",
  "pg diploma":           "Postgraduate Diploma",

  "higher diploma":       "Higher Diploma",
  "hd ":                  "Higher Diploma",
};

function normalizeLevel(raw) {
  if (!raw) return "";
  const lower = raw.toLowerCase().trim();
  // Exact match first
  if (LEVEL_CANON[lower]) return LEVEL_CANON[lower];
  // Prefix / contains match
  for (const [key, canon] of Object.entries(LEVEL_CANON)) {
    if (lower.startsWith(key) || lower === key.trim()) return canon;
  }
  return raw.trim();
}

// ─── Tab Structure Detection ──────────────────────────────────────────────────
// A valid tab has:
//   Row 1 (index 0): University / college name (non-empty, not a column header)
//   Row 2 (index 1): Column headers with "Campus" at A and something at C
// We detect this by checking that rows[1][0].trim().toLowerCase() === "campus"
function hasExpectedStructure(rows) {
  if (!rows || rows.length < 3) return false;
  const headerCell = (rows[1][0] || "").toString().trim().toLowerCase();
  return headerCell === "campus";
}

// ─── Category Row Detection ───────────────────────────────────────────────────
// A category row has a value only in column A; all other columns are blank.
function isCategoryRow(row) {
  if (!row || row.length === 0) return false;
  const first = (row[0] || "").toString().trim();
  if (!first) return false;
  for (let i = 1; i < row.length; i++) {
    if ((row[i] || "").toString().trim() !== "") return false;
  }
  return true;
}

// ─── Tab Parser ───────────────────────────────────────────────────────────────
/**
 * The "For Dublin 4IR" tab (and similar) repeats the following block for every
 * university:
 *
 *   Row A: University name  (only column A has a value)
 *   Row B: Column headers   (column A = "Campus")
 *   Row C+: Category rows / data rows
 *
 * We detect the header row by checking whether column A equals "campus".
 * When we see a header row, the previous non-blank "only-col-A" row was a
 * university name, not a level label.
 */
function parseSheetRows(rows, sheet) {
  if (!hasExpectedStructure(rows)) return [];

  const programs = [];
  let currentUniversity = (rows[0][0] || "").toString().trim() || sheet;
  let currentLevel = "";

  // i=0: university name (already captured)
  // i=1: headers (skip)
  // i=2+: data
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];

    // Skip entirely blank rows
    if (!row || row.every((cell) => (cell || "").toString().trim() === "")) {
      continue;
    }

    const colA = (row[0] || "").toString().trim();

    // ── Header row ─────────────────────────────────────────────────────────
    // Column A = "Campus" means this is a repeated column-header row.
    // The previous non-blank single-column row was a university name.
    if (colA.toLowerCase() === "campus") {
      // Look backwards for the last pending university-name candidate
      for (let j = i - 1; j >= 0; j--) {
        const prev = rows[j];
        if (!prev || prev.every((c) => (c || "").toString().trim() === "")) continue;
        if (isCategoryRow(prev)) {
          // This was a university name row, not a level
          currentUniversity = (prev[0] || "").toString().trim();
          currentLevel = ""; // reset level for new university block
        }
        break;
      }
      continue; // skip the header row itself
    }

    // ── Category or university-name row ────────────────────────────────────
    // A row where only column A has a value. We don't know yet whether it is
    // a level label or a university name — we decide when we see the next row.
    if (isCategoryRow(row)) {
      // Peek at the next non-blank row to decide
      let nextRow = null;
      for (let j = i + 1; j < rows.length; j++) {
        const r = rows[j];
        if (r && !r.every((c) => (c || "").toString().trim() === "")) {
          nextRow = r;
          break;
        }
      }
      const nextColA = (nextRow?.[0] || "").toString().trim().toLowerCase();
      if (nextColA === "campus") {
        // Next is a header row → current row is a university name
        currentUniversity = colA;
        currentLevel = "";
      } else {
        // It's a level/category label
        currentLevel = normalizeLevel(colA);
      }
      continue;
    }

    // ── Data row ───────────────────────────────────────────────────────────
    const programName = (row[2] || "").toString().trim();
    if (!programName) continue;

    programs.push({
      university:           currentUniversity,
      campus:               colA,
      referenceLink:        (row[1] || "").toString().trim(),
      programName,
      nfqQqi:               (row[3] || "").toString().trim(),
      availableIntakes:     (row[4] || "").toString().trim(),
      duration:             (row[5] || "").toString().trim(),
      tuitionFees:          (row[6] || "").toString().trim(),
      englishRequirements:  (row[7] || "").toString().trim(),
      academicRequirements: (row[8] || "").toString().trim(),
      level:                currentLevel,
      country:              "Ireland",
    });
  }

  return programs;
}

// ─── Public API ───────────────────────────────────────────────────────────────
async function getAllPrograms() {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error("GOOGLE_SPREADSHEET_ID is not set in environment variables.");
  }

  // Get all sheet (tab) names
  const metaRes = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheetNames = metaRes.data.sheets.map((s) => s.properties.title);

  // Fetch all tabs in one batch request
  const ranges = sheetNames.map((name) => `'${name}'`);
  const batchRes = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges,
    valueRenderOption: "FORMATTED_VALUE",
  });

  const allPrograms = [];
  (batchRes.data.valueRanges || []).forEach((valueRange, idx) => {
    const rows = valueRange.values || [];
    const parsed = parseSheetRows(rows, sheetNames[idx]);
    allPrograms.push(...parsed);
  });

  cache = { data: allPrograms, expiresAt: Date.now() + CACHE_TTL_MS };
  return allPrograms;
}

module.exports = { getAllPrograms };
