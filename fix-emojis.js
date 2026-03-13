const mysql = require("mysql2/promise");
require("dotenv").config();

async function fixEmojis() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset:  "utf8mb4",
  });

  const updates = [
    { id: 1,  icon: "🛒" },
    { id: 2,  icon: "🚌" },
    { id: 3,  icon: "💡" },
    { id: 4,  icon: "💊" },
    { id: 5,  icon: "👕" },
    { id: 6,  icon: "🎬" },
    { id: 7,  icon: "📚" },
    { id: 8,  icon: "📦" },
    { id: 9,  icon: "💼" },
    { id: 10, icon: "💻" },
    { id: 11, icon: "💰" },
  ];

  for (const { id, icon } of updates) {
    await db.query("UPDATE categories SET icon = ? WHERE id = ?", [icon, id]);
    console.log(`✅ Categoría ${id} actualizada con ${icon}`);
  }

  await db.end();
  console.log("🎉 Listo!");
}

fixEmojis().catch(console.error);
