const { Pool } = require('pg');

const pool = new Pool({
  host: '192.168.124.247',
  port: 5432,
  database: 'rat_db',
  user: 'naze',
  password: 'Naze666666'
});

async function addMissingFields() {
  try {
    console.log('Adding missing fields to requirements table...');

    await pool.query(`
      ALTER TABLE requirements 
      ADD COLUMN IF NOT EXISTS overall_owner VARCHAR(100);
    `);
    console.log('Added overall_owner field');

    await pool.query(`
      ALTER TABLE requirements 
      ADD COLUMN IF NOT EXISTS stage VARCHAR(50);
    `);
    console.log('Added stage field');

    await pool.query(`
      ALTER TABLE requirements 
      ADD COLUMN IF NOT EXISTS workload_estimate VARCHAR(100);
    `);
    console.log('Added workload_estimate field');

    await pool.query(`
      ALTER TABLE requirements 
      ADD COLUMN IF NOT EXISTS market_owner VARCHAR(100);
    `);
    console.log('Added market_owner field');

    await pool.query(`
      ALTER TABLE requirements 
      ADD COLUMN IF NOT EXISTS design_owner VARCHAR(100);
    `);
    console.log('Added design_owner field');

    await pool.query(`
      ALTER TABLE requirements 
      ADD COLUMN IF NOT EXISTS development_owner VARCHAR(100);
    `);
    console.log('Added development_owner field');

    await pool.query(`
      ALTER TABLE requirements 
      ADD COLUMN IF NOT EXISTS test_owner VARCHAR(100);
    `);
    console.log('Added test_owner field');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_requirements_stage ON requirements(stage);
    `);

    console.log('All fields added successfully!');
    
    await pool.end();
  } catch (error) {
    console.error('Error adding fields:', error);
    process.exit(1);
  }
}

addMissingFields();