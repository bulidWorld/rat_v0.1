import { query } from './db';

export async function initDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS requirements (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(10) NOT NULL CHECK (type IN ('SR', 'US')),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        source VARCHAR(100),
        value_description TEXT,
        status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
        delivery_date DATE,
        priority INTEGER CHECK (priority >= 1 AND priority <= 10),
        parent_id VARCHAR(50) REFERENCES requirements(id) ON DELETE CASCADE,
        overall_owner VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
        market_owner VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
        design_owner VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
        development_owner VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
        test_owner VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_requirements_type ON requirements(type);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_requirements_parent_id ON requirements(parent_id);
    `);

    // 用户表（缓存 LDAP 用户信息）
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        display_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        department VARCHAR(255),
        dn TEXT NOT NULL,
        last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    // 进展表
    await query(`
      CREATE TABLE IF NOT EXISTS progress (
        id VARCHAR(50) PRIMARY KEY,
        requirement_id VARCHAR(50) NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        attachments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_progress_requirement_id ON progress(requirement_id);
    `);

    console.log('Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    return false;
  }
}