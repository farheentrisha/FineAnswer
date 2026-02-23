const express = require("express");
const router = express.Router();
const { getAllPrograms } = require("../services/googleSheets");

/**
 * The sheet uses various intake formats: "Sept", "Sep", "September & February",
 * "Sept & Jan", "Jan", "Feb", "Apr", etc.
 * Convert the frontend intake value into a list of lowercase needles that will
 * match any of those sheet variants via a simple .includes() check.
 */
function intakeNeedles(raw) {
  const lower = raw.trim().toLowerCase();

  switch (lower) {
    case "january/february":
      return ["jan", "feb"];
    case "september":
    case "sept":
    case "sep":
      // "sep" matches "Sept", "Sep", "September & February", "Sept, Jan", etc.
      return ["sep"];
    case "january":
    case "jan":
      return ["jan"];
    case "february":
    case "feb":
      return ["feb"];
    case "april":
    case "apr":
      return ["apr"];
    default:
      return [lower];
  }
}

/**
 * GET /api/programs/search
 *
 * Query params:
 *   level    – partial, case-insensitive match against the program's level field
 *   country  – exact match (currently "Ireland" only)
 *   intake   – "September" | "January/February" | "April" (or any abbreviation)
 *
 * Returns [] when no params are provided.
 * Returns { error } with status 500 on failure.
 */
router.get("/search", async (req, res) => {
  const { level = "", country = "", intake = "" } = req.query;

  // Nothing to search
  if (!level.trim() && !country.trim() && !intake.trim()) {
    return res.json([]);
  }

  try {
    const all = await getAllPrograms();

    const results = all.filter((item) => {
      const itemLevel   = (item.level            || "").toLowerCase().trim();
      const itemIntakes = (item.availableIntakes  || "").toLowerCase().trim();
      const itemCountry = (item.country           || "").toLowerCase().trim();

      // ── Level ──────────────────────────────────────────────────────────────
      // The sheet category rows contain text like "Master's (Postgraduate)".
      // We do a partial match so the frontend can pass the exact label.
      if (level.trim()) {
        const needle = level.trim().toLowerCase();
        if (!itemLevel.includes(needle)) return false;
      }

      // ── Country ────────────────────────────────────────────────────────────
      if (country.trim()) {
        if (itemCountry !== country.trim().toLowerCase()) return false;
      }

      // ── Intake ─────────────────────────────────────────────────────────────
      // The sheet uses abbreviated month names ("Sept", "Jan", "Feb", "Apr").
      // Convert the frontend value to those abbreviations before matching.
      if (intake.trim()) {
        const needles = intakeNeedles(intake);
        const matched = needles.some((n) => itemIntakes.includes(n));
        if (!matched) return false;
      }

      return true;
    });

    return res.json(results);
  } catch (err) {
    console.error("[Programs] Search error:", err.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
