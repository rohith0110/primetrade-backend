import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">404</p>
      <h1 className="mt-3 text-3xl font-semibold">page not found</h1>
      <p className="mt-2 text-white/60">that route doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md border border-white/30 px-5 py-2 text-sm hover:border-white hover:bg-white hover:text-black"
      >
        back home
      </Link>
    </div>
  );
}
