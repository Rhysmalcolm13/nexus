'use client';

import { useSession } from '@/hooks/useSession';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedProps {
  children: ReactNode;
  permissions?: string[];
}

export function Protected({ children, permissions = [] }: ProtectedProps) {
  const { session, status } = useSession({ required: true });
  const [userTools, setUserTools] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/settings');
          const settings = await response.json();
          setUserTools(settings?.enabledTools ?? []);
        } catch (error) {
          console.error('Failed to load user settings:', error);
        }
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [session?.user?.id]);

  // Show loading state
  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  // Check permissions if specified
  if (permissions.length > 0) {
    const hasPermissions = permissions.every(p => userTools.includes(p));
    
    if (!hasPermissions) {
      return <div>Unauthorized</div>;
    }
  }

  return <>{children}</>;
} 