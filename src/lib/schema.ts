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

    console.log('Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    return false;
  }
}