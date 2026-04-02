const { Pool } = require('pg');

const pool = new Pool({
  host: '192.168.124.247',
  port: 5432,
  database: 'postgres',
  user: 'naze',
  password: 'Naze666666'
});

async function createDatabase() {
  try {
    const result = await pool.query('SELECT 1 FROM pg_database WHERE datname = $1', ['rat_db']);
    
    if (result.rows.length === 0) {
      await pool.query('CREATE DATABASE rat_db');
      console.log('Database rat_db created successfully');
    } else {
      console.log('Database rat_db already exists');
    }
    
    await pool.end();
    
    const newPool = new Pool({
      host: '192.168.124.247',
      port: 5432,
      database: 'rat_db',
      user: 'naze',
      password: 'Naze666666'
    });
    
    await newPool.query(`
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
    
    await newPool.query(`CREATE INDEX IF NOT EXISTS idx_requirements_type ON requirements(type);`);
    await newPool.query(`CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);`);
    await newPool.query(`CREATE INDEX IF NOT EXISTS idx_requirements_parent_id ON requirements(parent_id);`);
    
    console.log('Table requirements created successfully');
    
    await newPool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createDatabase();