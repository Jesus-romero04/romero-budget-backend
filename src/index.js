const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const app = express();

// ─── Middlewares ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Rutas ────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/categories",   require("./routes/categories"));

// ─── Health check ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "🚀 RomeroBudget API funcionando", version: "1.0.0" });
});

// ─── Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
