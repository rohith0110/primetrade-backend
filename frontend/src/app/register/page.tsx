'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  Alert,
  Button,
  Card,
  FieldError,
  FieldHint,
  Input,
  Label,
} from '@/components/ui';
import { fieldErrorsFrom, registerSchema } from '@/lib/validation';

type Field = 'name' | 'email' | 'password';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    name: false,
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function validate(showAll = false) {
    const result = registerSchema.safeParse({ name, email, password });
    if (!result.success) {
      setErrors(fieldErrorsFrom<typeof registerSchema>(result.error));
      if (showAll) setTouched({ name: true, email: true, password: true });
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
      await signUp(parsed.email, parsed.password, parsed.name);
    } catch (e: unknown) {
      setFormErr((e as { message?: string }).message ?? 'registration failed');
    } finally {
      setBusy(false);
    }
  }

  const showError = (f: Field) => (touched[f] ? errors[f] : undefined);

  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <h1 className="text-2xl font-semibold">create account</h1>
        <p className="mt-1 text-sm text-white/60">a quick journal for your trades.</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">name (optional)</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => onBlur('name')}
              invalid={!!showError('name')}
              placeholder="trader name"
            />
            <FieldError>{showError('name')}</FieldError>
          </div>

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
            />
            <FieldError>{showError('email')}</FieldError>
          </div>

          <div>
            <Label htmlFor="password">password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => onBlur('password')}
              invalid={!!showError('password')}
            />
            {showError('password') ? (
              <FieldError>{showError('password')}</FieldError>
            ) : (
              <FieldHint>at least 8 characters.</FieldHint>
            )}
          </div>

          {formErr && <Alert kind="error">{formErr}</Alert>}

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
