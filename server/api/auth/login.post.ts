import { defineEventHandler, readBody, setCookie, H3Error } from 'h3';
import ldap from 'ldapjs';

// LDAP 配置
const LDAP_CONFIG = {
  url: 'ldap://192.168.110.5:389',
  baseDN: 'dc=naze',
  adminDn: 'cn=admin,dc=naze',
  adminPassword: 'Naze666666',
  searchBase: 'dc=naze',
};

interface LDAPUser {
  dn: string;
  username: string;
  displayName: string;
  email?: string;
  department?: string;
}

function authenticateWithLDAP(username: string, password: string): Promise<LDAPUser | null> {
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
          reject(new Error('LDAP 认证失败'));
          return;
        }

        const searchFilter = `(&(objectClass=inetOrgPerson)(|(uid=${username})(cn=${username})(sAMAccountName=${username})))`;
        const entries: { dn: string; attrs: Record<string, string> }[] = [];

        client.search(
          LDAP_CONFIG.searchBase,
          {
            filter: searchFilter,
            scope: 'sub',
            attributes: ['dn', 'cn', 'displayName', 'mail', 'department', 'uid', 'sAMAccountName'],
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

              const attrsList = entry.attributes;
              for (const attr of attrsList) {
                if (attr && typeof attr.type === 'string' && attr.values) {
                  const type = attr.type;
                  const values = attr.values;
                  attrs[type.toLowerCase()] = Array.isArray(values) ? (values[0] as string) : String(values || '');
                }
              }

              entries.push({ dn, attrs });
            });

            res.on('end', () => {
              if (entries.length === 0) {
                console.error('LDAP user not found:', username);
                client.destroy();
                resolve(null);
                return;
              }

              const { dn, attrs } = entries[0];
              const foundUser: LDAPUser = {
                dn: dn,
                username: attrs.uid || attrs.samaccountname || username,
                displayName: attrs.cn || attrs.displayname || username,
                email: attrs.mail,
                department: attrs.department,
              };

              client.bind(dn, password, (authErr) => {
                client.destroy();
                if (authErr) {
                  console.error('LDAP authentication error:', authErr);
                  resolve(null);
                  return;
                }
                resolve(foundUser);
              });
            });

            res.on('error', (searchErr) => {
              console.error('LDAP search result error:', searchErr);
              client.destroy();
              reject(new Error('LDAP 搜索失败'));
            });
          }
        );
      });
    });
  });
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, password } = body;

    if (!username || !password) {
      throw createError({ statusCode: 400, message: '用户名和密码不能为空' });
    }

    const ldapUser = await authenticateWithLDAP(username, password);

    if (!ldapUser) {
      throw createError({ statusCode: 401, message: '用户名或密码错误' });
    }

    const sessionData = {
      user: {
        id: ldapUser.username,
        username: ldapUser.username,
        displayName: ldapUser.displayName,
        email: ldapUser.email,
        department: ldapUser.department,
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    setCookie(event, 'session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return { user: sessionData.user };
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({ statusCode: 500, message: '登录失败，请稍后重试' });
  }
});
