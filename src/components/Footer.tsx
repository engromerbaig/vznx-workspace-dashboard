"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isRoot = pathname === "/";

  if (isRoot) return null;

  return (
    <footer className="bg-gray-100 py-4 mt-auto">
      <div className="container mx-auto px-4 text-right">
        <p className="text-xs font-semibold text-gray-600">
          Designed and Developed by{" "}
          <Link
            href="https://www.sconstech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-scons/80 hover:text-scons transition-colors"
          >
            Scons Tech
          </Link>
        </p>
      </div>
    </footer>
  );
}
