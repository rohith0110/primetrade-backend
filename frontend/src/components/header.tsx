'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

function linkClasses(active: boolean) {
  return [
    'rounded px-3 py-1.5 text-sm transition',
    active ? 'bg-white text-black' : 'hover:bg-white hover:text-black',
  ].join(' ');
}

export function Header() {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // close the drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link
          href="/"
          className="truncate font-mono text-base tracking-tight hover:opacity-80 sm:text-lg"
        >
          primetrade<span className="text-white/40">.journal</span>
        </Link>

        {loading ? null : user ? (
          <>
            {/* desktop nav */}
            <nav className="hidden items-center gap-1 md:flex">
              <Link href="/dashboard" className={linkClasses(isActive('/dashboard'))}>
                dashboard
              </Link>
              <Link href="/trades" className={linkClasses(isActive('/trades'))}>
                trades
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className={linkClasses(isActive('/admin'))}>
                  admin
                </Link>
              )}
              <span className="ml-2 text-white/40">|</span>
              <span className="ml-2 max-w-[180px] truncate text-sm text-white/60" title={user.email}>
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="ml-2 rounded border border-white/20 px-3 py-1.5 text-sm hover:border-white hover:bg-white hover:text-black"
              >
                sign out
              </button>
            </nav>

            {/* mobile trigger */}
            <button
              type="button"
              aria-label={open ? 'close menu' : 'open menu'}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/20 hover:border-white hover:bg-white hover:text-black md:hidden"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {open ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </>
        ) : (
          <nav className="flex items-center gap-1">
            <Link
              href="/login"
              className="rounded px-3 py-1.5 text-sm hover:bg-white hover:text-black"
            >
              login
            </Link>
            <Link
              href="/register"
              className="rounded border border-white px-3 py-1.5 text-sm hover:bg-white hover:text-black"
            >
              register
            </Link>
          </nav>
        )}
      </div>

      {/* mobile drawer (authed users only — unauth nav already fits) */}
      {open && user && (
        <div id="mobile-nav" className="border-t border-white/10 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <p
              className="truncate px-3 pb-1 text-xs uppercase tracking-wider text-white/40"
              title={user.email}
            >
              {user.email}
            </p>
            <Link
              href="/dashboard"
              className={`block ${linkClasses(isActive('/dashboard'))}`}
            >
              dashboard
            </Link>
            <Link href="/trades" className={`block ${linkClasses(isActive('/trades'))}`}>
              trades
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/admin" className={`block ${linkClasses(isActive('/admin'))}`}>
                admin
              </Link>
            )}
            <button
              onClick={signOut}
              className="mt-1 rounded border border-white/20 px-3 py-2 text-left text-sm hover:border-white hover:bg-white hover:text-black"
            >
              sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
