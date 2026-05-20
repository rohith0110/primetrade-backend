'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Alert, Button, Card, Input, Label } from '@/components/ui';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (e: unknown) {
      setErr((e as { message?: string }).message ?? 'sign in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <h1 className="text-2xl font-semibold">sign in</h1>
        <p className="mt-1 text-sm text-white/60">welcome back.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {err && <Alert kind="error">{err}</Alert>}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'signing in…' : 'sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          no account?{' '}
          <Link href="/register" className="underline hover:text-white">
            register
          </Link>
        </p>
      </Card>
    </div>
  );
}
