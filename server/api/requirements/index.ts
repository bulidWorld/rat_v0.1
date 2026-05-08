import { defineEventHandler, getQuery, readBody } from 'h3';
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
  const method = event.method;

  if (method === 'GET') {
    try {
      const q = getQuery(event);
      const status = q.status as string | undefined;
      const priority = q.priority as string | undefined;
      const search = q.search as string | undefined;
      const overallOwner = q.overallOwner as string | undefined;
      const type = q.type as string | undefined;
      const sortField = (q.sortField as string) || 'created_at';
      const sortDirection = (q.sortDirection as string) || 'desc';
      const page = parseInt((q.page as string) || '1');
      const pageSize = parseInt((q.pageSize as string) || '10');

      let sql = `
        SELECT r.*,
          uo.display_name as overall_owner_name,
          um.display_name as market_owner_name,
          ud.display_name as design_owner_name,
          uv.display_name as development_owner_name,
          ut.display_name as test_owner_name
        FROM requirements r
        LEFT JOIN users uo ON r.overall_owner = uo.username
        LEFT JOIN users um ON r.market_owner = um.username
        LEFT JOIN users ud ON r.design_owner = ud.username
        LEFT JOIN users uv ON r.development_owner = uv.username
        LEFT JOIN users ut ON r.test_owner = ut.username
        WHERE 1=1
      `;
      const params: (string | number)[] = [];
      let paramIndex = 1;

      if (status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (priority) {
        const [min, max] = priority.split('-').map(Number);
        sql += ` AND priority >= $${paramIndex} AND priority <= $${paramIndex + 1}`;
        params.push(min, max);
        paramIndex += 2;
      }

      if (search) {
        sql += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR source ILIKE $${paramIndex} OR requirement_number ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (type) {
        sql += ` AND type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (overallOwner) {
        sql += ` AND (r.overall_owner = $${paramIndex} OR EXISTS (
          SELECT 1 FROM requirements child
          WHERE child.parent_id = r.id
          AND child.overall_owner = $${paramIndex}
        ))`;
        params.push(overallOwner);
        paramIndex++;
      }

      let countSql = 'SELECT COUNT(*) as total FROM requirements WHERE 1=1';
      const countParams: (string | number)[] = [];
      let countParamIndex = 1;

      if (status) {
        countSql += ` AND status = $${countParamIndex}`;
        countParams.push(status);
        countParamIndex++;
      }

      if (priority) {
        const [min, max] = priority.split('-').map(Number);
        countSql += ` AND priority >= $${countParamIndex} AND priority <= $${countParamIndex + 1}`;
        countParams.push(min, max);
        countParamIndex += 2;
      }

      if (search) {
        countSql += ` AND (title ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex} OR source ILIKE $${countParamIndex} OR requirement_number ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }

      if (type) {
        countSql += ` AND type = $${countParamIndex}`;
        countParams.push(type);
        countParamIndex++;
      }

      if (overallOwner) {
        countSql += ` AND (overall_owner = $${countParamIndex} OR EXISTS (
          SELECT 1 FROM requirements child
          WHERE child.parent_id = requirements.id
          AND child.overall_owner = $${countParamIndex}
        ))`;
        countParams.push(overallOwner);
        countParamIndex++;
      }

      const countResult = await query(countSql, countParams);
      const total = parseInt(countResult.rows[0].total);

      const validSortFields = ['title', 'priority', 'status', 'delivery_date', 'created_at', 'updated_at', 'requirement_number'];
      const validSortDirections = ['asc', 'desc'];

      const safeSortField = validSortFields.includes(sortField) ? sortField : 'created_at';
      const safeSortDirection = validSortDirections.includes(sortDirection) ? sortDirection : 'desc';

      sql += ` ORDER BY ${safeSortField} ${safeSortDirection.toUpperCase()}`;
      const offset = (page - 1) * pageSize;
      sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(pageSize, offset);

      const result = await query(sql, params);
      let requirements = result.rows.map(mapRequirement);

      if (!type || type === 'SR') {
        const srIds = requirements.filter(r => r.type === 'SR').map(r => r.id);
        if (srIds.length > 0) {
          const usSql = `
            SELECT r.*,
              uo.display_name as overall_owner_name,
              um.display_name as market_owner_name,
              ud.display_name as design_owner_name,
              uv.display_name as development_owner_name,
              ut.display_name as test_owner_name
            FROM requirements r
            LEFT JOIN users uo ON r.overall_owner = uo.username
            LEFT JOIN users um ON r.market_owner = um.username
            LEFT JOIN users ud ON r.design_owner = ud.username
            LEFT JOIN users uv ON r.development_owner = uv.username
            LEFT JOIN users ut ON r.test_owner = ut.username
            WHERE r.type = $1 AND r.parent_id = ANY($2)
          `;
          const usResult = await query(usSql, ['US', srIds]);
          const usRequirements = usResult.rows.map(mapRequirement);
          requirements = [...requirements, ...usRequirements];
        }
      }

      return {
        requirements,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
      };
    } catch (error) {
      console.error('Error fetching requirements:', error);
      throw createError({ statusCode: 500, message: 'Failed to fetch requirements' });
    }
  }

  if (method === 'POST') {
    try {
      const body = await readBody(event);
      const {
        type, title, description, source, valueDescription, status,
        deliveryDate, priority, parentId, overallOwner, stage,
        workloadEstimate, marketOwner, designOwner, developmentOwner, testOwner
      } = body;

      const client = await getClient();

      try {
        await client.query('BEGIN');

        const idResult = await client.query(`
          SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 0) + 1 as next_id
          FROM requirements
          WHERE id LIKE 'REQ-%'
        `);

        const nextIdNum = idResult.rows[0].next_id;
        const id = `REQ-${String(nextIdNum).padStart(3, '0')}`;

        const today = new Date();
        const dateStr = today.getFullYear().toString() +
          String(today.getMonth() + 1).padStart(2, '0') +
          String(today.getDate()).padStart(2, '0');

        const numberPrefix = `${type}-${dateStr}`;

        const numberResult = await client.query(`
          SELECT COUNT(*) + 1 as next_sequence
          FROM requirements
          WHERE requirement_number LIKE $1
        `, [`${numberPrefix}%`]);

        const nextSequence = numberResult.rows[0].next_sequence;
        const requirementNumber = `${numberPrefix}-${String(nextSequence).padStart(3, '0')}`;

        const result = await client.query(`
          INSERT INTO requirements (
            id, requirement_number, type, title, description, source,
            value_description, status, delivery_date, priority, parent_id,
            overall_owner, stage, workload_estimate, market_owner,
            design_owner, development_owner, test_owner
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *
        `, [
          id, requirementNumber, type, title, description, source,
          valueDescription, status, deliveryDate, priority, parentId,
          overallOwner, stage, workloadEstimate, marketOwner,
          designOwner, developmentOwner, testOwner
        ]);

        await client.query('COMMIT');

        return { requirement: mapRequirement(result.rows[0]) };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating requirement:', error);
      throw createError({ statusCode: 500, message: 'Failed to create requirement' });
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' });
});
