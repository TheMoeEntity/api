import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-base font-semibold tracking-tight text-stone-900">
          Refund Desk
        </Link>
        <nav className="flex gap-6 text-sm text-stone-600">
          <Link href="/" className="hover:text-stone-900">Customer</Link>
          <Link href="/admin" className="hover:text-stone-900">Support dashboard</Link>
        </nav>
      </div>
    </header>
  );
}
