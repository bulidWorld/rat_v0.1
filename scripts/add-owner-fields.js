const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'rat_db',
  user: 'naze',
  password: 'Naze666666'
});

async function addOwnerFields() {
  try {
    // 添加 owner 字段（如果不存在）
    const columns = [
      { name: 'overall_owner', ref: 'users(id) ON DELETE SET NULL' },
      { name: 'market_owner', ref: 'users(id) ON DELETE SET NULL' },
      { name: 'design_owner', ref: 'users(id) ON DELETE SET NULL' },
      { name: 'development_owner', ref: 'users(id) ON DELETE SET NULL' },
      { name: 'test_owner', ref: 'users(id) ON DELETE SET NULL' },
    ];

    for (const col of columns) {
      try {
        await pool.query(`
          ALTER TABLE requirements
          ADD COLUMN IF NOT EXISTS ${col.name} VARCHAR(100) REFERENCES ${col.ref}
        `);
        console.log(`Added column: ${col.name}`);
      } catch (err) {
        console.log(`Column ${col.name} may already exist: ${err.message}`);
      }
    }

    // 创建索引
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requirements_overall_owner ON requirements(overall_owner);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requirements_market_owner ON requirements(market_owner);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requirements_design_owner ON requirements(design_owner);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requirements_development_owner ON requirements(development_owner);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requirements_test_owner ON requirements(test_owner);
    `);

    console.log('Owner fields added successfully!');
    await pool.end();
  } catch (error) {
    console.error('Failed to add owner fields:', error);
  }
}

addOwnerFields();
