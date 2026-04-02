import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { initDatabase } from '@/lib/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    
    const { id } = await params;
    const result = await query('SELECT * FROM requirements WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
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
      updatedAt: result.rows[0].updated_at
    };

    return NextResponse.json({ requirement });
  } catch (error) {
    console.error('Error fetching requirement:', error);
    return NextResponse.json({ error: 'Failed to fetch requirement' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    
    const { id } = await params;
    const body = await request.json();
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
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
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
    console.error('Error updating requirement:', error);
    return NextResponse.json({ error: 'Failed to update requirement' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    
    const { id } = await params;
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      await client.query('DELETE FROM requirements WHERE parent_id = $1', [id]);

      const result = await client.query('DELETE FROM requirements WHERE id = $1 RETURNING *', [id]);

      await client.query('COMMIT');

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting requirement:', error);
    return NextResponse.json({ error: 'Failed to delete requirement' }, { status: 500 });
  }
}