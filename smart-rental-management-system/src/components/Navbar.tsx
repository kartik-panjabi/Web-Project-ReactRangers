// Navbar.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            // Get user role from token
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRole(payload.role);
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }, []);

    const handleLogout = () => {
        // Clear token and user data
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole(null);
        // Redirect to login page
        router.push('/auth/login');
    };

    // Don't render anything until after mounting to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <nav className="bg-white shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-blue-600">
                    Smart Rental
                </Link>
                
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <>
                            <Link 
                                href={userRole === 'Landlord' ? '/dashboard/landlord' : '/dashboard/tenant'} 
                                className="text-gray-600 hover:text-blue-600"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-blue-600"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login" className="text-gray-600 hover:text-blue-600">
                                Login
                            </Link>
                            <Link href="/auth/signup" className="text-gray-600 hover:text-blue-600">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}