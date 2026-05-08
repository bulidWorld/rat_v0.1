import { startUserSync } from './userSync';

// 全局同步状态
let userSyncStarted = false;

/**
 * 确保用户同步服务已启动
 * 只在服务首次调用时启动一次
 */
export function ensureUserSyncStarted() {
  if (!userSyncStarted) {
    userSyncStarted = true;
    startUserSync();
  }
}
