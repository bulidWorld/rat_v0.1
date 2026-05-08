import { defineEventHandler } from 'h3';
import { ensureUserSyncStarted } from '@/server/lib/syncInit';

export default defineEventHandler(() => {
  ensureUserSyncStarted();
  return { message: '用户同步服务已启动', status: 'running' };
});
