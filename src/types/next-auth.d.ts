import 'next-auth';
import type { UserSettings } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      settings?: UserSettings | null;
    };
  }
} 