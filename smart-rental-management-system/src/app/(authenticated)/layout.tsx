'use client';
import Link from "next/link";
import { useState } from "react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="flex min-h-screen">
            <button
                className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 transition-transform transform ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{ paddingTop: '50px' }}
            >
                <nav>
                    <ul className="space-y-4 mt-6">
                        <li><Link href="/dashboard" className="block p-2 hover:bg-gray-700">Dashboard</Link></li>
                        <li><Link href="/properties" className="block p-2 hover:bg-gray-700">Properties</Link></li>
                        <li><Link href="/payments" className="block p-2 hover:bg-gray-700">Payments</Link></li>
                        <li><Link href="/maintenance" className="block p-2 hover:bg-gray-700">Maintenance</Link></li>
                        <li><Link href="/chat" className="block p-2 hover:bg-gray-700">Chat</Link></li>
                        <li><Link href="/reviews" className="block p-2 hover:bg-gray-700">Reviews</Link></li>
                        <li><Link href="/auth/login" className="block p-2 hover:bg-gray-700">Logout</Link></li>
                    </ul>
                </nav>
            </aside>
            <main className="flex-1 p-6 ml-64">
                {children}
            </main>
        </div>
    );
} 