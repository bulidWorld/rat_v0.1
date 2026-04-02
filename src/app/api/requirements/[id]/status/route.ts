import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { initDatabase } from '@/lib/schema';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const result = await query(`
      UPDATE requirements
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

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
    console.error('Error updating requirement status:', error);
    return NextResponse.json({ error: 'Failed to update requirement status' }, { status: 500 });
  }
}