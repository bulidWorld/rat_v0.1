import { defineEventHandler, getQuery, readBody } from 'h3';
import { query, getClient } from '@/server/lib/db';

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    const q = getQuery(event);
    const requirementId = q.requirementId as string | undefined;

    if (!requirementId) {
      throw createError({ statusCode: 400, message: 'Requirement ID is required' });
    }

    const result = await query(
      'SELECT * FROM progress WHERE requirement_id = $1 ORDER BY created_at DESC',
      [requirementId]
    );

    const progress = result.rows.map(row => ({
      id: row.id,
      requirementId: row.requirement_id,
      title: row.title,
      description: row.description,
      attachments: row.attachments,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { progress };
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { requirementId, title, description, attachments } = body;

    if (!requirementId || !title) {
      throw createError({ statusCode: 400, message: 'Requirement ID and title are required' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const idResult = await client.query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 0) + 1 as next_id
        FROM progress
        WHERE id LIKE 'PRG-%'
      `);

      const nextIdNum = idResult.rows[0].next_id;
      const id = `PRG-${String(nextIdNum).padStart(3, '0')}`;

      const result = await client.query(`
        INSERT INTO progress (id, requirement_id, title, description, attachments)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [id, requirementId, title, description, attachments || null]);

      await client.query('COMMIT');

      const progress = {
        id: result.rows[0].id,
        requirementId: result.rows[0].requirement_id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        attachments: result.rows[0].attachments,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at,
      };

      return { progress };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' });
});
