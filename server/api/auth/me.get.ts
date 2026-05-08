import { defineEventHandler, getCookie } from 'h3';

export default defineEventHandler((event) => {
  const sessionCookie = getCookie(event, 'session');

  if (!sessionCookie) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  try {
    const session = JSON.parse(sessionCookie);

    if (new Date(session.expiresAt) < new Date()) {
      throw createError({ statusCode: 401, message: 'Session expired' });
    }

    return { user: session.user };
  } catch {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }
});
