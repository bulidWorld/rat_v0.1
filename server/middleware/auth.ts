import { defineEventHandler, getCookie, sendRedirect } from 'h3';

// 不需要认证的路由
const publicRoutes = ['/login', '/api/auth', '/api/'];

export default defineEventHandler((event) => {
  const url = event.path;

  // 检查是否是公开路由或 API 路由
  // API 路由的认证由各 API handler 自行处理，中间件只保护页面
  for (const route of publicRoutes) {
    if (url.startsWith(route)) {
      return;
    }
  }

  // 获取 session cookie
  const sessionCookie = getCookie(event, 'session');

  if (!sessionCookie) {
    return sendRedirect(event, `/login?callbackUrl=${encodeURIComponent(url)}`);
  }

  try {
    const session = JSON.parse(sessionCookie);

    // 检查会话是否过期
    if (new Date(session.expiresAt) < new Date()) {
      event.node.res.setHeader('Set-Cookie', 'session=; HttpOnly; SameSite=lax; Max-Age=0; Path=/');
      return sendRedirect(event, `/login?callbackUrl=${encodeURIComponent(url)}`);
    }
  } catch {
    event.node.res.setHeader('Set-Cookie', 'session=; HttpOnly; SameSite=lax; Max-Age=0; Path=/');
    return sendRedirect(event, `/login?callbackUrl=${encodeURIComponent(url)}`);
  }
});
