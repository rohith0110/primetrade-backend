'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Alert, Button, Card, FieldError, Input, Label } from '@/components/ui';
import { fieldErrorsFrom, loginSchema } from '@/lib/validation';

type Field = 'email' | 'password';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function validate(showAll = false) {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const next = fieldErrorsFrom<typeof loginSchema>(result.error);
      setErrors(next);
      if (showAll) setTouched({ email: true, password: true });
      return null;
    }
    setErrors({});
    return result.data;
  }

  function onBlur(field: Field) {
    setTouched((t) => ({ ...t, [field]: true }));
    validate();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const parsed = validate(true);
    if (!parsed) return;

    setBusy(true);
    try {
      await signIn(parsed.email, parsed.password);
    } catch (e: unknown) {
      setFormErr((e as { message?: string }).message ?? 'sign in failed');
    } finally {
      setBusy(false);
    }
  }

  const showError = (f: Field) => (touched[f] ? errors[f] : undefined);

  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <h1 className="text-2xl font-semibold">sign in</h1>
        <p className="mt-1 text-sm text-white/60">welcome back.</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={254}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => onBlur('email')}
              invalid={!!showError('email')}
              aria-describedby="email-err"
            />
            <span id="email-err">
              <FieldError>{showError('email')}</FieldError>
            </span>
          </div>

          <div>
            <Label htmlFor="password">password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              maxLength={128}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => onBlur('password')}
              invalid={!!showError('password')}
              aria-describedby="password-err"
            />
            <span id="password-err">
              <FieldError>{showError('password')}</FieldError>
            </span>
          </div>

          {formErr && <Alert kind="error">{formErr}</Alert>}

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
