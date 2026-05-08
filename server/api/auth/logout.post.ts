import { defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler((event) => {
  deleteCookie(event, 'session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return { success: true };
});
