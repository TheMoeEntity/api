import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-stone-600">That page or refund request doesn't exist.</p>
      <Link href="/" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">Go to the refund form</Link>
    </div>
  );
}
