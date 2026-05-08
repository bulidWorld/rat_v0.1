const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'rat_db',
  user: 'naze',
  password: 'Naze666666'
});

// 显示名到 LDAP 用户名的映射
const displayNameToUsername = {
  '田俊': 'tianjun',
  '曾议萱': 'zengyixuan',
  '张孟宇': 'zhangmengyu',
  '支文侠': 'zhiwenxia',
  '田坤': 'tiankun',
  '曾 yixuan': 'zengyixuan',
  '曾 Yixuan': 'zengyixuan',  // 大小写变体
  '田景东': 'tianjingdong',
};

// 需要迁移的负责人字段
const ownerFields = [
  'overall_owner',
  'market_owner',
  'development_owner',
  'design_owner',
  'test_owner',
];

async function migrateOwners() {
  try {
    console.log('=== 开始迁移负责人字段 ===\n');

    // 1. 首先确保 users 表中有这些用户
    console.log('1. 检查/同步用户到 users 表...');
    for (const [displayName, username] of Object.entries(displayNameToUsername)) {
      const result = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        // 用户不存在，插入
        await pool.query(
          `INSERT INTO users (id, username, display_name, dn)
           VALUES ($1, $2, $3, $4)`,
          [username, username, displayName, `uid=${username},ou=people,dc=naze`]
        );
        console.log(`   [插入] ${displayName} -> ${username}`);
      } else {
        console.log(`   [已存在] ${displayName} -> ${username}`);
      }
    }

    // 2. 获取所有不同的负责人值
    console.log('\n2. 获取当前负责人数据...');
    const allOwners = new Set();

    for (const field of ownerFields) {
      const result = await pool.query(`SELECT DISTINCT ${field} FROM requirements WHERE ${field} IS NOT NULL`);
      result.rows.forEach(row => {
        if (row[field]) allOwners.add(row[field]);
      });
    }

    console.log('   当前存在的负责人值:', Array.from(allOwners).join(', '));

    // 3. 执行迁移
    console.log('\n3. 开始迁移数据...');
    let totalUpdated = 0;

    for (const field of ownerFields) {
      for (const [displayName, username] of Object.entries(displayNameToUsername)) {
        const result = await pool.query(
          `UPDATE requirements SET ${field} = $1 WHERE ${field} = $2`,
          [username, displayName]
        );

        if (result.rowCount > 0) {
          console.log(`   [迁移] ${field}: "${displayName}" -> "${username}" (${result.rowCount} 条记录)`);
          totalUpdated += result.rowCount;
        }
      }
    }

    // 特殊处理：更新 "曾 yixuan" -> "zengyixuan"
    // 使用 LIKE 匹配包含"曾"的值
    for (const field of ownerFields) {
      // 匹配所有以"曾"开头的值
      const result = await pool.query(
        `UPDATE requirements SET ${field} = 'zengyixuan' WHERE ${field} LIKE '曾%'`
      );
      if (result.rowCount > 0) {
        console.log(`   [迁移] ${field}: "曾*" -> "zengyixuan" (${result.rowCount} 条记录)`);
        totalUpdated += result.rowCount;
      }
    }

    // 4. 显示迁移后的结果
    console.log('\n4. 迁移后数据验证...');
    for (const field of ownerFields) {
      const result = await pool.query(`SELECT DISTINCT ${field} FROM requirements WHERE ${field} IS NOT NULL`);
      const values = result.rows.map(r => r[field]).filter(Boolean);
      console.log(`   ${field}: ${values.join(', ') || '(无数据)'}`);
    }

    console.log('\n=== 迁移完成 ===');
    console.log(`共更新 ${totalUpdated} 条记录`);

    await pool.end();
  } catch (error) {
    console.error('迁移失败:', error);
    await pool.end();
    process.exit(1);
  }
}

migrateOwners();
