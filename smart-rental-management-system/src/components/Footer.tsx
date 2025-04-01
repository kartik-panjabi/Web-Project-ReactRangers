"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8 text-center shadow-md">
      <p className="hover:text-gray-400 transition">&copy; {new Date().getFullYear()} Smart Rental Management. All rights reserved.</p>
    </footer>
  );
}
