import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold">
          Gimme Golf
        </Link>
        <ul className="flex gap-6 text-sm font-medium">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/locations">Locations</Link>
          </li>
          <li>
            <Link href="/book">Book</Link>
          </li>
          <li>
            <Link href="/shop">Shop</Link>
          </li>
          <li>
            <Link href="/build">Build</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
