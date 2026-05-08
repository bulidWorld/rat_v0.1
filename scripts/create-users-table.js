const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'rat_db',
  user: 'naze',
  password: 'Naze666666'
});

async function createUsersTable() {
  try {
    console.log('Creating users table...');

    await pool.query(`
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

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    console.log('Users table created successfully!');

    // 插入 4 个用户
    const users = [
      { id: 'tianjun', username: 'tianjun', displayName: '田俊', dn: 'uid=tianjun,ou=people,dc=naze' },
      { id: 'zengyixuan', username: 'zengyixuan', displayName: '曾议萱', dn: 'uid=zengyixuan,ou=people,dc=naze' },
      { id: 'zhangmengyu', username: 'zhangmengyu', displayName: '张孟宇', dn: 'uid=zhangmengyu,ou=people,dc=naze' },
      { id: 'zhiwenxia', username: 'zhiwenxia', displayName: '支文侠', dn: 'uid=zhiwenxia,ou=people,dc=naze' },
    ];

    console.log('\nInserting users...');
    for (const user of users) {
      await pool.query(`
        INSERT INTO users (id, username, display_name, dn)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
      `, [user.id, user.username, user.displayName, user.dn]);
      console.log(`  Inserted: ${user.displayName} (${user.username})`);
    }

    console.log('\nDone!');
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

createUsersTable();
