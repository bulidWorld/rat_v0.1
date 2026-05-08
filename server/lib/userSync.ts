import { syncUsersFromLDAP } from './userService';

let syncInterval: NodeJS.Timeout | null = null;
let isSyncing = false;
let isStarted = false;

/**
 * 执行用户同步
 */
async function performSync() {
  if (isSyncing) {
    console.log('[UserSync] Skip - already syncing');
    return;
  }

  isSyncing = true;
  try {
    console.log('[UserSync] Starting user sync...');
    const users = await syncUsersFromLDAP();
    console.log(`[UserSync] Synced  users successfully`);
  } catch (error) {
    console.error('[UserSync] Sync failed:', error);
  } finally {
    isSyncing = false;
  }
}

/**
 * 启动定时同步服务
 * - 启动时立即同步一次
 * - 之后每隔 1 小时同步一次
 */
export function startUserSync() {
  // if (isStarted) return;
  // isStarted = true;

  // // 启动时立即同步一次
  // performSync();

  // // 设置每小时同步一次的定时器
  // syncInterval = setInterval(performSync, 60 * 60 * 1000); // 1 hour

  // console.log('[UserSync] Scheduled sync started (interval: 1 hour)');
}

/**
 * 停止定时同步服务
 */
export function stopUserSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('[UserSync] Scheduled sync stopped');
  }
}
