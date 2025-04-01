// forgot-password.tsx
'use client';
import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Reset password link sent to", email);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <form onSubmit={handleReset} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mb-4" required />
                <button type="submit" className="w-full bg-yellow-500 text-white p-2 rounded">Reset Password</button>
            </form>
            <a href="/auth/login" className="text-blue-500 mt-4">Back to Login</a>
        </div>
    );
}