'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SignaturePad from 'react-signature-canvas';

interface Lease {
    _id: string;
    property: {
        _id: string;
        title: string;
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
    };
    startDate: string;
    endDate: string;
    rentAmount: number;
    status: string;
}

export default function SignLease({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();
    const [lease, setLease] = useState<Lease | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const signaturePadRef = useRef<SignaturePad | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            router.push('/login');
            return;
        }
        setToken(storedToken);

        const fetchLease = async () => {
            try {
                const response = await fetch(`/api/leases/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch lease');
                }

                const data = await response.json();
                setLease(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch lease');
            } finally {
                setLoading(false);
            }
        };

        fetchLease();
    }, [id, router]);

    const handleClear = () => {
        signaturePadRef.current?.clear();
    };

    const handleSign = async () => {
        if (!signaturePadRef.current || !lease || !token) return;

        const signatureDataUrl = signaturePadRef.current.toDataURL();

        try {
            const response = await fetch(`/api/leases/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'sign_tenant',
                    signature: signatureDataUrl
                })
            });

            if (!response.ok) {
                throw new Error('Failed to sign lease');
            }

            router.push('/dashboard/tenant/leases');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign lease');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600 text-lg">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    if (!lease) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600 text-lg">Lease not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Sign Lease</h1>

                    {/* Property Details */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">Property Details</h2>
                        <p className="text-gray-700">{lease.property.title}</p>
                        <p className="text-gray-700">
                            {lease.property.address.street}, {lease.property.address.city}, {lease.property.address.state} {lease.property.address.zipCode}
                        </p>
                    </div>

                    {/* Lease Terms */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">Lease Terms</h2>
                        <p className="text-gray-700">Start Date: {new Date(lease.startDate).toLocaleDateString()}</p>
                        <p className="text-gray-700">End Date: {new Date(lease.endDate).toLocaleDateString()}</p>
                        <p className="text-gray-700">Monthly Rent: ${lease.rentAmount}</p>
                    </div>

                    {/* Signature Section */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">Your Signature</h2>
                        <div className="border border-gray-300 rounded-lg p-4">
                            <SignaturePad
                                ref={signaturePadRef}
                                canvasProps={{
                                    className: 'w-full h-48 border border-gray-300 rounded'
                                }}
                            />
                            <div className="mt-4 flex justify-end space-x-4">
                                <button
                                    onClick={handleClear}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => router.push('/dashboard/tenant/leases')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSign}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Sign Lease
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
