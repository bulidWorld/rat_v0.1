import Pool from 'pg';

const pool = new Pool.Pool({
  host: '192.168.124.247',
  port: 5432,
  database: 'rat_db',
  user: 'naze',
  password: 'Naze666666',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
  return res;
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export default pool;