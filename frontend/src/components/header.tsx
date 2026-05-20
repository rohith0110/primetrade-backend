'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-mono text-lg tracking-tight hover:opacity-80">
          primetrade<span className="text-white/40">.journal</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded px-3 py-1.5 hover:bg-white hover:text-black"
              >
                dashboard
              </Link>
              <Link
                href="/trades"
                className="rounded px-3 py-1.5 hover:bg-white hover:text-black"
              >
                trades
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="rounded px-3 py-1.5 hover:bg-white hover:text-black"
                >
                  admin
                </Link>
              )}
              <span className="ml-2 text-white/40">|</span>
              <span className="ml-2 hidden text-white/60 sm:inline">{user.email}</span>
              <button
                onClick={signOut}
                className="ml-2 rounded border border-white/20 px-3 py-1.5 hover:border-white hover:bg-white hover:text-black"
              >
                sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded px-3 py-1.5 hover:bg-white hover:text-black"
              >
                login
              </Link>
              <Link
                href="/register"
                className="rounded border border-white px-3 py-1.5 hover:bg-white hover:text-black"
              >
                register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
