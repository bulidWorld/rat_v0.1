import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { initDatabase } from '@/lib/schema';

export async function POST() {
  try {
    await initDatabase();
    
    const checkResult = await query('SELECT COUNT(*) as count FROM requirements');
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return NextResponse.json({ message: 'Database already has data', count: checkResult.rows[0].count });
    }

    const sampleRequirements = [
      {
        id: 'REQ-001',
        type: 'SR',
        title: '优化用户登录流程',
        description: '当前登录流程过于复杂，需要简化步骤，提高用户体验。',
        source: '用户反馈',
        valueDescription: '简化登录流程可以提高用户留存率和转化率。',
        status: 'pending',
        deliveryDate: '2024-03-15',
        priority: 1,
        parentId: null
      },
      {
        id: 'REQ-002',
        type: 'US',
        title: '简化登录表单字段',
        description: '移除不必要的登录表单字段，只保留用户名和密码。',
        source: '产品需求',
        valueDescription: '减少用户填写时间，提高登录成功率。',
        status: 'approved',
        deliveryDate: '2024-03-20',
        priority: 1,
        parentId: 'REQ-001'
      },
      {
        id: 'REQ-003',
        type: 'US',
        title: '添加记住密码功能',
        description: '允许用户选择记住密码，下次登录自动填充。',
        source: '产品需求',
        valueDescription: '提高用户登录便捷性，减少重复输入。',
        status: 'pending',
        deliveryDate: '2024-03-25',
        priority: 2,
        parentId: 'REQ-001'
      },
      {
        id: 'REQ-004',
        type: 'SR',
        title: '添加数据导出功能',
        description: '允许用户导出报表数据，支持Excel和PDF格式。',
        source: '产品需求',
        valueDescription: '数据导出功能可以满足企业用户的数据分析需求。',
        status: 'approved',
        deliveryDate: '2024-04-01',
        priority: 3,
        parentId: null
      },
      {
        id: 'REQ-005',
        type: 'US',
        title: '实现Excel导出功能',
        description: '开发Excel格式的数据导出功能，支持所有报表。',
        source: '产品需求',
        valueDescription: '满足用户基本的数据导出需求。',
        status: 'approved',
        deliveryDate: '2024-03-28',
        priority: 3,
        parentId: 'REQ-004'
      }
    ];

    for (const req of sampleRequirements) {
      await query(`
        INSERT INTO requirements (id, type, title, description, source, value_description, status, delivery_date, priority, parent_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [req.id, req.type, req.title, req.description, req.source, req.valueDescription, req.status, req.deliveryDate, req.priority, req.parentId]);
    }

    return NextResponse.json({ message: 'Sample data inserted successfully', count: sampleRequirements.length });
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return NextResponse.json({ error: 'Failed to initialize sample data' }, { status: 500 });
  }
}