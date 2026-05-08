export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  department?: string;
}

export interface DBUser {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  department?: string;
  dn: string;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expiresAt: Date;
}
