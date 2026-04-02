const { Pool } = require('pg');

const pool = new Pool({
  host: '192.168.124.247',
  port: 5432,
  database: 'rat_db',
  user: 'naze',
  password: 'Naze666666'
});

async function updateSchema() {
  try {
    await pool.query(`
      ALTER TABLE requirements 
      ADD COLUMN IF NOT EXISTS requirement_number VARCHAR(50) UNIQUE;
    `);
    
    console.log('Added requirement_number column');

    const existingData = await pool.query('SELECT id, type, created_at FROM requirements');
    
    for (const row of existingData.rows) {
      const type = row.type;
      const createdAt = new Date(row.created_at);
      const dateStr = createdAt.getFullYear().toString() +
        String(createdAt.getMonth() + 1).padStart(2, '0') +
        String(createdAt.getDate()).padStart(2, '0');
      
      const idNum = row.id.replace('REQ-', '');
      const requirementNumber = `${type}-${dateStr}-${idNum}`;
      
      await pool.query('UPDATE requirements SET requirement_number = $1 WHERE id = $2', [requirementNumber, row.id]);
      
      console.log(`Updated ${row.id} with requirement_number: ${requirementNumber}`);
    }
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requirements_number ON requirements(requirement_number);
    `);
    
    console.log('Schema update completed successfully');
    
    await pool.end();
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

updateSchema();