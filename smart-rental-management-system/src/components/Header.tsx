"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">Smart Rental</h1>
      <nav className="flex space-x-4">
        <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
        <Link href="/properties" className="hover:text-gray-300">Properties</Link>
        <Link href="/payments" className="hover:text-gray-300">Payments</Link>
        <Link href="/auth/login" className="hover:text-gray-300">Logout</Link>
      </nav>
    </header>
  );
}
