const express = require("express");
const router = express.Router();
const { getAllPrograms } = require("../services/googleSheets");

/**
 * GET /api/programs/search
 *
 * Query params:
 *   program  – partial, case-insensitive match against programName
 *   country  – exact match (currently "Ireland" only)
 *   intake   – checks if availableIntakes contains this string
 *
 * Returns [] when no params are provided.
 * Returns { error } with 500 when something goes wrong.
 */
router.get("/search", async (req, res) => {
  const { program = "", country = "", intake = "" } = req.query;

  // Return empty array when nothing is searched
  if (!program.trim() && !country.trim() && !intake.trim()) {
    return res.json([]);
  }

  try {
    const all = await getAllPrograms();

    const results = all.filter((item) => {
      // Program – partial, case-insensitive match
      if (program.trim()) {
        const needle = program.trim().toLowerCase();
        if (!item.programName.toLowerCase().includes(needle)) return false;
      }

      // Country – exact match (case-insensitive)
      if (country.trim()) {
        if (item.country.toLowerCase() !== country.trim().toLowerCase()) return false;
      }

      // Intake – check if availableIntakes contains the value
      if (intake.trim()) {
        const needle = intake.trim().toLowerCase();
        if (!item.availableIntakes.toLowerCase().includes(needle)) return false;
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
