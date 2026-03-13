const db = require("../config/db");

// ─── Obtener todas las transacciones (toda la familia) ────
const getAll = async (req, res) => {
  const { month, year, type, category_id } = req.query;

  let query = `
    SELECT t.*, 
           c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
           u.name AS user_name, u.avatar AS user_avatar
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    JOIN users u ON t.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (month && year) {
    query += " AND MONTH(t.date) = ? AND YEAR(t.date) = ?";
    params.push(month, year);
  }
  if (type) {
    query += " AND t.type = ?";
    params.push(type);
  }
  if (category_id) {
    query += " AND t.category_id = ?";
    params.push(category_id);
  }

  query += " ORDER BY t.date DESC, t.created_at DESC";

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener transacciones", error: err.message });
  }
};

// ─── Crear transacción ────────────────────────────────────
const create = async (req, res) => {
  const { category_id, type, amount, description, date } = req.body;

  if (!category_id || !type || !amount || !date) {
    return res.status(400).json({ message: "Categoría, tipo, monto y fecha son requeridos" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO transactions (user_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, category_id, type, amount, description || "", date]
    );

    const [rows] = await db.query(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
              u.name AS user_name, u.avatar AS user_avatar
       FROM transactions t 
       JOIN categories c ON t.category_id = c.id
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: "Transacción creada", transaction: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Error al crear transacción", error: err.message });
  }
};

// ─── Eliminar transacción ─────────────────────────────────
const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT id FROM transactions WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Transacción no encontrada o no tenés permiso" });
    }

    await db.query("DELETE FROM transactions WHERE id = ?", [id]);
    res.json({ message: "Transacción eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar transacción", error: err.message });
  }
};

// ─── Resumen familiar del mes ─────────────────────────────
const summary = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: "month y year son requeridos" });
  }

  try {
    const [totals] = await db.query(
      `SELECT 
        SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
       FROM transactions
       WHERE MONTH(date) = ? AND YEAR(date) = ?`,
      [month, year]
    );

    const [byCategory] = await db.query(
      `SELECT c.name, c.icon, c.color, SUM(t.amount) AS total
       FROM transactions t JOIN categories c ON t.category_id = c.id
       WHERE t.type = 'expense' AND MONTH(t.date) = ? AND YEAR(t.date) = ?
       GROUP BY c.id ORDER BY total DESC`,
      [month, year]
    );

    const [byMember] = await db.query(
      `SELECT u.name, u.avatar,
        SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END) AS income,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS expense
       FROM transactions t JOIN users u ON t.user_id = u.id
       WHERE MONTH(t.date) = ? AND YEAR(t.date) = ?
       GROUP BY u.id`,
      [month, year]
    );

    const income  = parseFloat(totals[0].total_income  || 0);
    const expense = parseFloat(totals[0].total_expense || 0);

    res.json({
      income,
      expense,
      balance: income - expense,
      by_category: byCategory,
      by_member: byMember,
    });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener resumen", error: err.message });
  }
};
const monthlySummary = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        DATE_FORMAT(date, '%b') as month_name,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m'), DATE_FORMAT(date, '%b')
      ORDER BY month ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
};

module.exports = { getAll, create, remove, summary, monthlySummary };