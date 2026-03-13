-- RomeroBudget schema para Railway

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(150)        NOT NULL UNIQUE,
  password   VARCHAR(255)        NOT NULL,
  avatar     VARCHAR(500)        DEFAULT '{"iconId":"user","color":"#3b82f6"}',
  role       ENUM('admin','member') DEFAULT 'member',
  created_at TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  icon  VARCHAR(50)  NOT NULL,
  type  ENUM('income','expense') NOT NULL,
  color VARCHAR(20)  DEFAULT '#00e5ff'
);

INSERT INTO categories (name, icon, type, color) VALUES
  ('Comida',          'shopping-cart', 'expense', '#ef4444'),
  ('Transporte',      'truck',         'expense', '#f97316'),
  ('Servicios',       'zap',           'expense', '#eab308'),
  ('Salud',           'heart-pulse',   'expense', '#ec4899'),
  ('Ropa',            'shirt',         'expense', '#8b5cf6'),
  ('Entretenimiento', 'film',          'expense', '#06b6d4'),
  ('Educación',       'book-open',     'expense', '#3b82f6'),
  ('Otros gastos',    'box',           'expense', '#6b7280'),
  ('Sueldo',          'briefcase',     'income',  '#22c55e'),
  ('Freelance',       'monitor',       'income',  '#10b981'),
  ('Otros ingresos',  'dollar-sign',   'income',  '#84cc16');

CREATE TABLE IF NOT EXISTS transactions (
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

CREATE TABLE IF NOT EXISTS budgets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT           NOT NULL,
  category_id INT           NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  month       TINYINT       NOT NULL,
  year        SMALLINT      NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_budget (user_id, category_id, month, year),
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_user  ON transactions(user_id);
CREATE INDEX idx_transactions_date  ON transactions(date);
CREATE INDEX idx_transactions_type  ON transactions(type);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month, year);
