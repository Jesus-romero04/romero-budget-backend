const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT || 3306,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset:  "utf8mb4",
  collation: "utf8mb4_unicode_ci",
  waitForConnections: true,
  connectionLimit: 10,
});
