import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { prisma } from '@/lib/db/prisma';

/**
 * Get the current session, with caching for same request
 */
export const getSession = cache(async () => {
  return await getServerSession(authOptions);
});

/**
 * Get the current user from session
 * @throws Redirects to signin if no session exists
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return session.user;
}

/**
 * Verify user has required permissions
 * @throws Redirects to unauthorized page if user lacks permissions
 */
export async function verifyPermissions(requiredPermissions: string[]) {
  const session = await getSession();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
    select: { enabledTools: true }
  });

  const hasPermissions = requiredPermissions.every(
    permission => settings?.enabledTools.includes(permission)
  );

  if (!hasPermissions) {
    redirect('/unauthorized');
  }
} 