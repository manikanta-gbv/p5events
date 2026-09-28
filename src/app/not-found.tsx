import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <main className="pt-[104px] md:pt-[122px] mx-auto max-w-shell px-5 py-24 text-center md:px-14">
        <h1 className="font-display text-4xl">Page not found</h1>
        <p className="mt-3 text-body">
          That page has moved or never existed.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-11 items-center rounded-pill bg-accent px-6 text-sm font-semibold text-white"
        >
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}
