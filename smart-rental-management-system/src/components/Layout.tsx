// src/app/layout.tsx
import "../styles/globals.css"; // ✅ Ensures Tailwind CSS is loaded
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>Smart Rental Management</title>
      </head>
      <body className="flex min-h-screen bg-gray-100 text-gray-900">
        <Navbar />
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        {isOpen && (
          <aside className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 transition-transform transform translate-x-0">
            <Sidebar />
          </aside>
        )}

        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}
