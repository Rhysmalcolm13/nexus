import { useSession as useNextAuthSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useSession({ required = true } = {}) {
  const { data: session, status } = useNextAuthSession();
  const router = useRouter();

  // Handle loading state
  if (status === 'loading') {
    return {
      session: null,
      status: 'loading' as const,
      user: null
    };
  }

  // Redirect if session is required but doesn't exist
  if (required && !session) {
    router.push('/auth/signin');
    return {
      session: null,
      status: 'unauthenticated' as const,
      user: null
    };
  }

  return {
    session,
    status: status as 'authenticated' | 'unauthenticated',
    user: session?.user ?? null
  };
} 