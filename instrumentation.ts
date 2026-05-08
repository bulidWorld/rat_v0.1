// 动态 import，避免 Node.js-only 模块被打包到 edge runtime
async function startSync() {
  const { startUserSync } = await import('./src/lib/userSync');
  startUserSync();
}

// 在 Next.js 服务器启动时执行
export async function register() {
  console.log(process.env);
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    startSync();
  }
}
