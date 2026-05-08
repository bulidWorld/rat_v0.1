import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { query } from '@/server/lib/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID is required' });

  const body = await readBody(event);
  const { status } = body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    throw createError({ statusCode: 400, message: 'Invalid status' });
  }

  const result = await query(`
    UPDATE requirements
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `, [status, id]);

  if (result.rows.length === 0) {
    throw createError({ statusCode: 404, message: 'Requirement not found' });
  }

  const requirement = {
    id: result.rows[0].id,
    requirementNumber: result.rows[0].requirement_number,
    type: result.rows[0].type,
    title: result.rows[0].title,
    description: result.rows[0].description,
    source: result.rows[0].source,
    valueDescription: result.rows[0].value_description,
    status: result.rows[0].status,
    deliveryDate: result.rows[0].delivery_date,
    priority: result.rows[0].priority,
    parentId: result.rows[0].parent_id,
    createdAt: result.rows[0].created_at,
    updatedAt: result.rows[0].updated_at,
  };

  return { requirement };
});
