import ldap from 'ldapjs';
import { query } from './db';

// LDAP 配置
const LDAP_CONFIG = {
  url: 'ldap://192.168.110.5:389',
  baseDN: 'dc=naze',
  adminDn: 'cn=admin,dc=naze',
  adminPassword: 'Naze666666',
  searchBase: 'ou=people,dc=naze',
};

export interface LDAPUser {
  dn: string;
  username: string;
  displayName: string;
  email?: string;
  department?: string;
}

/**
 * 从 LDAP 同步所有用户到本地数据库
 */
export async function syncUsersFromLDAP(): Promise<LDAPUser[]> {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: LDAP_CONFIG.url,
      connectTimeout: 10000,
      timeout: 10000,
    });

    client.on('error', (err) => {
      console.error('LDAP connection error:', err);
      reject(new Error('LDAP 连接失败'));
    });

    client.on('connect', () => {
      client.bind(LDAP_CONFIG.adminDn, LDAP_CONFIG.adminPassword, (bindErr) => {
        if (bindErr) {
          console.error('LDAP admin bind error:', bindErr);
          client.destroy();
          reject(new Error('LDAP 管理员绑定失败'));
          return;
        }

        const allUsers: LDAPUser[] = [];

        // 搜索所有 inetOrgPerson 用户
        const searchFilter = '(objectClass=inetOrgPerson)';

        client.search(
          LDAP_CONFIG.searchBase,
          {
            filter: searchFilter,
            scope: 'sub',
            attributes: ['uid', 'cn', 'displayName', 'mail', 'department', 'dn'],
          },
          (searchErr, res) => {
            if (searchErr) {
              console.error('LDAP search error:', searchErr);
              client.destroy();
              reject(new Error('LDAP 搜索失败'));
              return;
            }

            res.on('searchEntry', (entry) => {
              const dn = String(entry.dn);
              const attrs: Record<string, string> = {};

              console.log('[LDAP] Entry DN:', dn);
              console.log('[LDAP] entry.attributes:', entry.attributes, Array.isArray(entry.attributes));

              const attrsList = entry.attributes;
              for (const attr of attrsList) {
                if (attr && typeof attr.type === 'string') {
                  const type = attr.type;
                  const values = attr.values;
                  console.log(`[LDAP] attr ${type} = ${values}`);
                  attrs[type.toLowerCase()] = Array.isArray(values) ? (values[0] as string) : String(values || '');
                } else {
                  console.log('[LDAP] Skipping invalid attr:', attr, typeof attr);
                }
              }

              console.log('[LDAP] Parsed attrs:', attrs);

              allUsers.push({
                dn: dn,
                username: attrs.uid || '',
                displayName: attrs.cn || attrs.displayname || attrs.uid || '',
                email: attrs.mail,
                department: attrs.department,
              });
            });

            res.on('end', async () => {
              client.destroy();

              // 将用户保存到数据库
              for (const user of allUsers) {
                await upsertUser(user);
              }

              resolve(allUsers);
            });

            res.on('error', (err) => {
              console.error('LDAP search result error:', err);
              client.destroy();
              reject(new Error('LDAP 搜索结果错误'));
            });
          }
        );
      });
    });
  });
}

/**
 * 插入或更新用户到数据库
 */
async function upsertUser(user: LDAPUser): Promise<void> {
  try {
    // 检查用户是否已存在
    const existingResult = await query(
      'SELECT id FROM users WHERE username = $1',
      [user.username]
    );

    if (existingResult.rows.length > 0) {
      // 更新现有用户
      await query(
        `UPDATE users SET
          display_name = $2,
          email = $3,
          department = $4,
          dn = $5,
          updated_at = CURRENT_TIMESTAMP,
          last_synced_at = CURRENT_TIMESTAMP
        WHERE username = $1`,
        [user.username, user.displayName, user.email, user.department, user.dn]
      );
    } else {
      // 插入新用户
      await query(
        `INSERT INTO users (id, username, display_name, email, department, dn)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.username, user.username, user.displayName, user.email, user.department, user.dn]
      );
    }
  } catch (error) {
    console.error('Failed to upsert user:', user.username, error);
  }
}

/**
 * 从数据库获取所有用户
 */
export async function getAllUsers(): Promise<LDAPUser[]> {
  try {
    const result = await query(
      'SELECT id, username, display_name, email, department FROM users ORDER BY username'
    );

    return result.rows.map((row) => ({
      dn: '',
      username: row.id,
      displayName: row.display_name,
      email: row.email,
      department: row.department,
    }));
  } catch (error) {
    console.error('Failed to get all users:', error);
    return [];
  }
}

/**
 * 根据 username 获取单个用户
 */
export async function getUserByUsername(username: string): Promise<LDAPUser | null> {
  try {
    const result = await query(
      'SELECT id, username, display_name, email, department FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      dn: '',
      username: row.id,
      displayName: row.display_name,
      email: row.email,
      department: row.department,
    };
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

/**
 * 获取用户显示名称
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  const user = await getUserByUsername(userId);
  return user?.displayName || userId;
}
