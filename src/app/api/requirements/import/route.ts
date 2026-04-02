import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { query, getClient } from '@/lib/db';
import { initDatabase } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const client = await getClient();
    const results = {
      total: data.length,
      created: 0,
      updated: 0,
      errors: [] as string[]
    };

    try {
      await client.query('BEGIN');

      for (let i = 0; i < data.length; i++) {
        const row: any = data[i];
        
        await client.query('SAVEPOINT row_savepoint');
        
        try {
          const requirementNumber = row['需求编号'];
          if (!requirementNumber) {
            await client.query('ROLLBACK TO SAVEPOINT row_savepoint');
            results.errors.push(`第${i + 2}行：缺少需求编号`);
            continue;
          }

          const type = requirementNumber.startsWith('SR') ? 'SR' : requirementNumber.startsWith('US') ? 'US' : 'SR';

          let parentId = null;
          if (type === 'US' && row['父需求']) {
            const parentNumber = row['父需求'];
            const parentResult = await client.query(
              'SELECT id FROM requirements WHERE requirement_number = $1',
              [parentNumber]
            );
            if (parentResult.rows.length > 0) {
              parentId = parentResult.rows[0].id;
            }
          }

          const existResult = await client.query(
            'SELECT id FROM requirements WHERE requirement_number = $1',
            [requirementNumber]
          );

          const title = row['需求标题'] || '';
          const description = row['需求描述'] || '';
          const overallOwner = row['整体负责人'] || '';
          const stage = row['阶段'] || '';
          const source = row['需求来源'] || '';
          const workloadEstimate = row['工作量评估'] || '';
          
          let deliveryDate = null;
          const deliveryDateRaw = row['交付日期'];
          if (deliveryDateRaw && deliveryDateRaw.trim() !== '') {
            try {
              if (typeof deliveryDateRaw === 'number') {
                const date = new Date((deliveryDateRaw - 25569) * 86400 * 1000);
                deliveryDate = date.toISOString().split('T')[0];
              } else {
                const parsed = new Date(deliveryDateRaw);
                if (!isNaN(parsed.getTime())) {
                  deliveryDate = parsed.toISOString().split('T')[0];
                }
              }
            } catch (e) {
              deliveryDate = null;
            }
          }
          
          const marketOwner = row['市场负责人'] || '';
          const designOwner = row['设计负责人'] || '';
          const developmentOwner = row['开发负责人'] || '';
          const testOwner = row['测试负责人'] || '';
          const priority = parseInt(row['优先级']) || 5;
          
          let status = 'pending';
          const statusStr = row['状态'] || '';
          if (statusStr === '已通过') status = 'approved';
          else if (statusStr === '已拒绝') status = 'rejected';

          if (existResult.rows.length > 0) {
            await client.query(`
              UPDATE requirements
              SET title = $1, description = $2, overall_owner = $3, stage = $4,
                  source = $5, workload_estimate = $6, delivery_date = $7, market_owner = $8,
                  design_owner = $9, development_owner = $10, test_owner = $11, priority = $12,
                  status = $13, parent_id = $14, updated_at = CURRENT_TIMESTAMP
              WHERE requirement_number = $15
            `, [
              title, description, overallOwner, stage, source, workloadEstimate,
              deliveryDate, marketOwner, designOwner, developmentOwner, testOwner,
              priority, status, parentId, requirementNumber
            ]);
            results.updated++;
          } else {
            const idResult = await client.query(`
              SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 0) + 1 as next_id
              FROM requirements
              WHERE id LIKE 'REQ-%'
            `);
            
            const nextIdNum = idResult.rows[0].next_id;
            const id = `REQ-${String(nextIdNum).padStart(3, '0')}`;

            await client.query(`
              INSERT INTO requirements (
                id, requirement_number, type, title, description, source,
                status, delivery_date, priority, parent_id, overall_owner, stage,
                workload_estimate, market_owner, design_owner, development_owner, test_owner
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            `, [
              id, requirementNumber, type, title, description, source,
              status, deliveryDate, priority, parentId, overallOwner, stage,
              workloadEstimate, marketOwner, designOwner, developmentOwner, testOwner
            ]);
            results.created++;
          }
        } catch (error) {
          await client.query('ROLLBACK TO SAVEPOINT row_savepoint');
          const errorMsg = error instanceof Error ? error.message : String(error);
          results.errors.push(`第${i + 2}行：${errorMsg}`);
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({
        message: '导入完成',
        results
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importing requirements:', error);
    return NextResponse.json({ error: 'Failed to import requirements' }, { status: 500 });
  }
}