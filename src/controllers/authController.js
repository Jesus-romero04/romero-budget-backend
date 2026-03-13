const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const db     = require("../config/db");

// ─── Registro ─────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password, avatar = "👤" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nombre, email y contraseña son requeridos" });
  }

  try {
    // Verificar si el email ya existe
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, avatar]
    );

    const token = jwt.sign(
      { id: result.insertId, name, email, avatar },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Usuario registrado",
      token,
      user: { id: result.insertId, name, email, avatar, role: "member" },
    });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
};

// ─── Login ────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
};

// ─── Perfil ───────────────────────────────────────────────
const profile = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, avatar, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { name, avatar, currentPassword, newPassword } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const user = rows[0];
    const updates = [];
    const values = [];

    if (name) { updates.push("name = ?"); values.push(name); }
    if (avatar) { updates.push("avatar = ?"); values.push(avatar); }

    if (currentPassword && newPassword) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(400).json({ message: "Contraseña actual incorrecta" });
      const hashed = await bcrypt.hash(newPassword, 10);
      updates.push("password = ?");
      values.push(hashed);
    }

    if (updates.length === 0) return res.status(400).json({ message: "Nada que actualizar" });

    values.push(req.user.id);
    await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

    const [updated] = await db.query("SELECT id, name, email, avatar, role FROM users WHERE id = ?", [req.user.id]);

    res.json({ message: "Perfil actualizado", user: updated[0] });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
};

module.exports = { register, login, profile, updateProfile };
