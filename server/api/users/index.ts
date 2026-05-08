import { defineEventHandler } from 'h3';
import { getAllUsers, syncUsersFromLDAP } from '@/server/lib/userService';

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    try {
      const users = await getAllUsers();
      return { users };
    } catch (error) {
      console.error('Failed to get users:', error);
      throw createError({ statusCode: 500, message: '获取用户列表失败' });
    }
  }

  if (method === 'POST') {
    try {
      const users = await syncUsersFromLDAP();
      return { message: '用户同步成功', count: users.length, users };
    } catch (error) {
      console.error('Failed to sync users:', error);
      throw createError({ statusCode: 500, message: '同步用户失败' });
    }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' });
});
