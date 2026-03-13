-- ============================================================
-- RomeroBudget — Base de datos MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS romero_budget CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE romero_budget;

-- ─── Usuarios ─────────────────────────────────────────────
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(150)        NOT NULL UNIQUE,
  password   VARCHAR(255)        NOT NULL,
  avatar     VARCHAR(10)         DEFAULT '👤',         -- emoji avatar
  role       ENUM('admin','member') DEFAULT 'member',  -- admin puede ver todo
  created_at TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ─── Categorías ───────────────────────────────────────────
CREATE TABLE categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  icon  VARCHAR(10)  NOT NULL,   -- emoji
  type  ENUM('income','expense') NOT NULL,
  color VARCHAR(20)  DEFAULT '#00e5ff'
);

-- Categorías por defecto
INSERT INTO categories (name, icon, type, color) VALUES
  -- Gastos
  ('Comida',        '🛒', 'expense', '#ef4444'),
  ('Transporte',    '🚌', 'expense', '#f97316'),
  ('Servicios',     '💡', 'expense', '#eab308'),
  ('Salud',         '💊', 'expense', '#ec4899'),
  ('Ropa',          '👕', 'expense', '#8b5cf6'),
  ('Entretenimiento','🎬','expense', '#06b6d4'),
  ('Educación',     '📚', 'expense', '#3b82f6'),
  ('Otros gastos',  '📦', 'expense', '#6b7280'),
  -- Ingresos
  ('Sueldo',        '💼', 'income',  '#22c55e'),
  ('Freelance',     '💻', 'income',  '#10b981'),
  ('Otros ingresos','💰', 'income',  '#84cc16');

-- ─── Transacciones ────────────────────────────────────────
CREATE TABLE transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT            NOT NULL,
  category_id INT            NOT NULL,
  type        ENUM('income','expense') NOT NULL,
  amount      DECIMAL(10,2)  NOT NULL,
  description VARCHAR(255),
  date        DATE           NOT NULL,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- ─── Presupuestos mensuales ───────────────────────────────
-- Límite de gasto por categoría por mes
CREATE TABLE budgets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT           NOT NULL,
  category_id INT           NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,   -- límite mensual
  month       TINYINT       NOT NULL,   -- 1-12
  year        SMALLINT      NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_budget (user_id, category_id, month, year),
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ─── Índices para performance ─────────────────────────────
CREATE INDEX idx_transactions_user    ON transactions(user_id);
CREATE INDEX idx_transactions_date    ON transactions(date);
CREATE INDEX idx_transactions_type    ON transactions(type);
CREATE INDEX idx_budgets_user_month   ON budgets(user_id, month, year);
