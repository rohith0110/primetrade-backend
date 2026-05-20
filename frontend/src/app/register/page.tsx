'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Alert, Button, Card, Input, Label } from '@/components/ui';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) {
      setErr('password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      await signUp(email, password, name || undefined);
    } catch (e: unknown) {
      setErr((e as { message?: string }).message ?? 'registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <h1 className="text-2xl font-semibold">create account</h1>
        <p className="mt-1 text-sm text-white/60">
          a quick journal for your trades.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">name (optional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="trader name"
            />
          </div>
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-white/40">at least 8 characters.</p>
          </div>

          {err && <Alert kind="error">{err}</Alert>}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'creating…' : 'create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/60">
          already have one?{' '}
          <Link href="/login" className="underline hover:text-white">
            sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
