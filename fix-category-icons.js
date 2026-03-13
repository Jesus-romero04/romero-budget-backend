const mysql = require("mysql2/promise");
require("dotenv").config();

async function fixIcons() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset:  "utf8mb4",
  });

  const updates = [
    { id: 1,  icon: "shopping-cart" },
    { id: 2,  icon: "truck" },
    { id: 3,  icon: "zap" },
    { id: 4,  icon: "heart-pulse" },
    { id: 5,  icon: "shirt" },
    { id: 6,  icon: "film" },
    { id: 7,  icon: "book-open" },
    { id: 8,  icon: "box" },
    { id: 9,  icon: "briefcase" },
    { id: 10, icon: "monitor" },
    { id: 11, icon: "dollar-sign" },
  ];

  for (const { id, icon } of updates) {
    await db.query("UPDATE categories SET icon = ? WHERE id = ?", [icon, id]);
    console.log(`✅ Categoría ${id} → ${icon}`);
  }

  await db.end();
  console.log("🎉 Listo!");
}

fixIcons().catch(console.error);