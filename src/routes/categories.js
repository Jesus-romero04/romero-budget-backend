const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const auth    = require("../middlewares/auth");

// Obtener todas las categorías
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY type, name");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener categorías", error: err.message });
  }
});

module.exports = router;
