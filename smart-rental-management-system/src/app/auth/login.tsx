// login.tsx
'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store the token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on user role
            switch (data.user.role) {
                case 'Admin':
                    router.push('/dashboard/admin');
                    break;
                case 'Landlord':
                    router.push('/dashboard/landlord');
                    break;
                case 'Tenant':
                    router.push('/dashboard/tenant');
                    break;
                default:
                    router.push('/dashboard');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Sign In</h1>
            <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>
            <div className="mt-4 space-y-2 text-center">
                <Link href="/auth/forgot" className="text-blue-500 hover:underline block">
                    Forgot your password?
                </Link>
                <Link href="/auth/signup" className="text-blue-500 hover:underline block">
                    Don't have an account? Sign up
                </Link>
            </div>
        </div>
    );
}