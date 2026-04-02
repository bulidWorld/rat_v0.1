const { Pool } = require('pg');

const pool = new Pool({
  host: '192.168.124.247',
  port: 5432,
  database: 'rat_db',
  user: 'naze',
  password: 'Naze666666'
});

async function deleteAllRequirements() {
  try {
    console.log('Deleting all requirements...');
    
    const result = await pool.query('DELETE FROM requirements');
    
    console.log(`Deleted ${result.rowCount} requirements`);
    
    await pool.end();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteAllRequirements();