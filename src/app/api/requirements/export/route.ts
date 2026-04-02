import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx-js-style';
import { query } from '@/lib/db';
import { initDatabase } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    await initDatabase();
    
    const result = await query('SELECT * FROM requirements ORDER BY created_at DESC');
    
    const headers = [
      '需求编号', '父需求', '需求标题', '需求描述', '整体负责人',
      '阶段', '需求来源', '工作量评估', '交付日期', '市场负责人',
      '设计负责人', '开发负责人', '测试负责人', '优先级', '状态'
    ];

    const data = result.rows.map(row => [
      row.requirement_number,
      row.parent_id || '',
      row.title,
      row.description,
      row.overall_owner || '',
      row.stage || '',
      row.source,
      row.workload_estimate || '',
      row.delivery_date,
      row.market_owner || '',
      row.design_owner || '',
      row.development_owner || '',
      row.test_owner || '',
      row.priority,
      row.status === 'pending' ? '待评审' : row.status === 'approved' ? '已通过' : '已拒绝'
    ]);

    const wsData = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = [
      { wch: 18 }, { wch: 15 }, { wch: 30 }, { wch: 80 }, { wch: 12 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 10 }
    ];
    ws['!cols'] = colWidths;

    const rowHeight = { hpt: 20 };
    const rowHeights = [];
    for (let i = 0; i <= result.rows.length; i++) {
      rowHeights.push(rowHeight);
    }
    ws['!rows'] = rowHeights;

    const headerStyle = {
      font: { bold: true, size: 12, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '00B050' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    for (let col = 0; col < headers.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) ws[cellAddress] = { v: headers[col] };
      ws[cellAddress].s = headerStyle;
    }

    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows[i];
      const rowNum = i + 1;
      
      const cellStyle = {
        font: { size: 12 },
        alignment: { vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        },
        fill: row.type === 'US' ? { fgColor: { rgb: 'D3D3D3' } } : undefined
      };

      for (let col = 0; col < headers.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: data[i][col] };
        ws[cellAddress].s = cellStyle;
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '需求列表');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="requirements.xlsx"'
      }
    });
  } catch (error) {
    console.error('Error exporting requirements:', error);
    return NextResponse.json({ error: 'Failed to export requirements' }, { status: 500 });
  }
}