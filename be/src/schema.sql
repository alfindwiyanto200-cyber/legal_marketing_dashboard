-- Schema for the Legal & Digital Marketing dashboard.
-- Requires MySQL 5.7+ (JSON column type). Run via `npm run db:init`.

CREATE TABLE IF NOT EXISTS projects (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  pic_name       VARCHAR(255) NOT NULL,
  pic_phone      VARCHAR(50),
  company_name   VARCHAR(255),
  business_field VARCHAR(255),
  service        VARCHAR(50),
  source         VARCHAR(50),
  payment_status VARCHAR(20)  NOT NULL DEFAULT 'unpaid',
  payment_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  project_value  DECIMAL(15,2) NOT NULL DEFAULT 0,
  deadline       DATE NULL,
  notes          TEXT,
  stages         JSON,
  status         VARCHAR(20)  NOT NULL DEFAULT 'leads',
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  date        DATE NOT NULL,
  type        ENUM('in','out') NOT NULL,
  amount      DECIMAL(15,2) NOT NULL DEFAULT 0,
  category    VARCHAR(50),
  description VARCHAR(255),
  proof_path  VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
