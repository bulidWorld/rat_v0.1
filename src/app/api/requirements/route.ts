import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { initDatabase } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    await initDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const sortField = searchParams.get('sortField') || 'created_at';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    let sql = 'SELECT * FROM requirements WHERE 1=1';
    const params: any[] = [];
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

    const validSortFields = ['title', 'priority', 'status', 'delivery_date', 'created_at', 'updated_at', 'requirement_number'];
    const validSortDirections = ['asc', 'desc'];
    
    const safeSortField = validSortFields.includes(sortField) ? sortField : 'created_at';
    const safeSortDirection = validSortDirections.includes(sortDirection) ? sortDirection : 'desc';

    sql += ` ORDER BY ${safeSortField} ${safeSortDirection.toUpperCase()}`;

    const result = await query(sql, params);
    
    const requirements = result.rows.map(row => ({
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
      stage: row.stage,
      workloadEstimate: row.workload_estimate,
      marketOwner: row.market_owner,
      designOwner: row.design_owner,
      developmentOwner: row.development_owner,
      testOwner: row.test_owner,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
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
        overallOwner: result.rows[0].overall_owner,
        stage: result.rows[0].stage,
        workloadEstimate: result.rows[0].workload_estimate,
        marketOwner: result.rows[0].market_owner,
        designOwner: result.rows[0].design_owner,
        developmentOwner: result.rows[0].development_owner,
        testOwner: result.rows[0].test_owner,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      };

      return NextResponse.json({ requirement });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating requirement:', error);
    return NextResponse.json({ error: 'Failed to create requirement' }, { status: 500 });
  }
}