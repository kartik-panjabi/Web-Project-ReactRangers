import React from "react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-center">
      <h1 className="text-3xl font-bold text-gray-700">🚫 404 - Page Not Found</h1>
      <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
      <Link href="/" className="mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
        Go Home
      </Link>
    </div>
  );
}
