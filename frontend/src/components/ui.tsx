import { type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline' | 'ghost' | 'danger';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'solid', className, ...rest },
  ref,
) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    solid: 'bg-white text-black hover:bg-white/90',
    outline:
      'border border-white/30 bg-transparent text-white hover:border-white hover:bg-white hover:text-black',
    ghost: 'bg-transparent text-white hover:bg-white/10',
    danger:
      'border border-white/20 bg-transparent text-white hover:border-accent-red hover:bg-accent-red hover:text-white',
  }[variant];

  return <button ref={ref} className={cx(base, styles, className)} {...rest} />;
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cx(
          'w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none',
          className,
        )}
        {...rest}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cx(
          'w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none',
          className,
        )}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cx(
          'w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-white focus:border-white focus:outline-none',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    );
  },
);

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs uppercase tracking-wide text-white/60">
      {children}
    </label>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-lg border border-white/10 bg-black p-5', className)}>{children}</div>
  );
}

export function Alert({
  kind = 'info',
  children,
}: {
  kind?: 'info' | 'error' | 'success';
  children: React.ReactNode;
}) {
  const styles = {
    info: 'border-white/30 text-white',
    error: 'border-accent-red text-accent-red',
    success: 'border-accent-green text-accent-green',
  }[kind];
  return (
    <div className={cx('rounded-md border px-3 py-2 text-sm', styles)} role="alert">
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'green' | 'red' | 'amber';
}) {
  const styles = {
    neutral: 'border-white/30 text-white',
    green: 'border-accent-green text-accent-green',
    red: 'border-accent-red text-accent-red',
    amber: 'border-accent-amber text-accent-amber',
  }[tone];
  return (
    <span
      className={cx(
        'inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider',
        styles,
      )}
    >
      {children}
    </span>
  );
}
