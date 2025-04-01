'use client';
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Welcome to Smart Rental Management System</h1>
            <p className="text-lg text-gray-700 mb-6 text-center max-w-2xl">
                Your all-in-one solution for managing rental properties, payments, and tenant interactions with ease.
            </p>

            <div className="grid gap-6 text-center sm:grid-cols-2 md:grid-cols-3">
                <Link href="/auth/login" className="p-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition">
                    Login
                </Link>
                <Link href="/auth/signup" className="p-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition">
                    Sign Up
                </Link>
                <Link href="/dashboard" className="p-4 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-900 transition">
                    Dashboard
                </Link>
                <Link href="/properties" className="p-4 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition">
                    View Properties
                </Link>
                <Link href="/payments" className="p-4 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition">
                    Manage Payments
                </Link>
            </div>
        </div>
    );
}