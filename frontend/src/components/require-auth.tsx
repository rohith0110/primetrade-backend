'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function RequireAuth({
  role,
  children,
}: {
  role?: 'USER' | 'ADMIN';
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (role && user.role !== role && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [loading, user, role, router]);

  if (loading) {
    return <div className="py-20 text-center text-white/40">loading…</div>;
  }
  if (!user) return null;
  if (role && user.role !== role && user.role !== 'ADMIN') return null;
  return <>{children}</>;
}
