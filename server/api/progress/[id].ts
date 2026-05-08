import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { query, getClient } from '@/server/lib/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID is required' });

  const method = event.method;

  if (method === 'PUT') {
    const body = await readBody(event);
    const { title, description, attachments } = body;

    const result = await query(`
      UPDATE progress
      SET title = $1, description = $2, attachments = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [title, description, attachments, id]);

    if (result.rows.length === 0) {
      throw createError({ statusCode: 404, message: 'Progress not found' });
    }

    return {
      progress: {
        id: result.rows[0].id,
        requirementId: result.rows[0].requirement_id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        attachments: result.rows[0].attachments,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at,
      }
    };
  }

  if (method === 'DELETE') {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const result = await client.query('DELETE FROM progress WHERE id = $1 RETURNING *', [id]);
      await client.query('COMMIT');

      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Progress not found' });
      }

      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' });
});
