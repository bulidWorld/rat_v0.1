import { useCookies } from '#imports';
import { Session, User } from '@/types/user';

export async function getSession(): Promise<Session | null> {
  const cookieStore = useCookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value);

    // 检查会话是否过期
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user || null;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
