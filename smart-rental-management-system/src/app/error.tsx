"use client";
import React from "react";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-center">
      <h1 className="text-red-500 text-3xl font-bold">⚠️ Something went wrong!</h1>
      <p className="text-gray-600 mt-2">Please try again later.</p>
      <Link href="/" className="mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
        Go Home
      </Link>
    </div>
  );
}
