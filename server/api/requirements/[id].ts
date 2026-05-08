import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { query, getClient } from '@/server/lib/db';

function mapRequirement(row: any) {
  return {
    id: row.id,
    requirementNumber: row.requirement_number,
    type: row.type,
    title: row.title,
    description: row.description,
    source: row.source,
    valueDescription: row.value_description,
    status: row.status,
    deliveryDate: row.delivery_date,
    priority: row.priority,
    parentId: row.parent_id,
    overallOwner: row.overall_owner,
    overallOwnerName: row.overall_owner_name,
    stage: row.stage,
    workloadEstimate: row.workload_estimate,
    marketOwner: row.market_owner,
    marketOwnerName: row.market_owner_name,
    designOwner: row.design_owner,
    designOwnerName: row.design_owner_name,
    developmentOwner: row.development_owner,
    developmentOwnerName: row.development_owner_name,
    testOwner: row.test_owner,
    testOwnerName: row.test_owner_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID is required' });

  const method = event.method;

  if (method === 'GET') {
    try {
      const result = await query('SELECT * FROM requirements WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Requirement not found' });
      }
      return { requirement: mapRequirement(result.rows[0]) };
    } catch (error: any) {
      if (error.statusCode) throw error;
      console.error('Error fetching requirement:', error);
      throw createError({ statusCode: 500, message: 'Failed to fetch requirement' });
    }
  }

  if (method === 'PUT') {
    try {
      const body = await readBody(event);
      const {
        type, title, description, source, valueDescription, status,
        deliveryDate, priority, parentId, overallOwner, stage,
        workloadEstimate, marketOwner, designOwner, developmentOwner, testOwner
      } = body;

      const result = await query(`
        UPDATE requirements
        SET type = $1, title = $2, description = $3, source = $4, value_description = $5,
            status = $6, delivery_date = $7, priority = $8, parent_id = $9,
            overall_owner = $10, stage = $11, workload_estimate = $12, market_owner = $13,
            design_owner = $14, development_owner = $15, test_owner = $16, updated_at = CURRENT_TIMESTAMP
        WHERE id = $17
        RETURNING *
      `, [
        type, title, description, source, valueDescription, status,
        deliveryDate, priority, parentId, overallOwner, stage,
        workloadEstimate, marketOwner, designOwner, developmentOwner, testOwner, id
      ]);

      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Requirement not found' });
      }

      return { requirement: mapRequirement(result.rows[0]) };
    } catch (error: any) {
      if (error.statusCode) throw error;
      console.error('Error updating requirement:', error);
      throw createError({ statusCode: 500, message: 'Failed to update requirement' });
    }
  }

  if (method === 'DELETE') {
    try {
      const client = await getClient();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM requirements WHERE parent_id = $1', [id]);
        const result = await client.query('DELETE FROM requirements WHERE id = $1 RETURNING *', [id]);
        await client.query('COMMIT');

        if (result.rows.length === 0) {
          throw createError({ statusCode: 404, message: 'Requirement not found' });
        }

        return { success: true };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      if (error.statusCode) throw error;
      console.error('Error deleting requirement:', error);
      throw createError({ statusCode: 500, message: 'Failed to delete requirement' });
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' });
});
