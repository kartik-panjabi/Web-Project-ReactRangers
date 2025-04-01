'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignaturePad from 'react-signature-canvas';
import { use } from 'react';

interface Lease {
    _id: string;
    property: {
        name: string;
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
    };
    tenant: {
        name: string;
        email: string;
    };
    startDate: string;
    endDate: string;
    rentAmount: number;
    securityDeposit: number;
    paymentDueDay: number;
    terms: string;
    status: string;
    tenantSignature: {
        signature: string;
        signedAt: string;
    };
    advancedPayment?: {
        amount: number;
        dueDate: string;
        status: string;
    };
}

export default function SignLease({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [lease, setLease] = useState<Lease | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
    const resolvedParams = use(params);

    useEffect(() => {
        const fetchLease = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch(`/api/leases/${resolvedParams.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch lease');
                }

                const data = await response.json();
                setLease(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchLease();
    }, [resolvedParams.id]);

    const handleSign = async () => {
        try {
            if (!signaturePad || !lease) return;

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const signature = signaturePad.toDataURL();

            const response = await fetch(`/api/leases/${resolvedParams.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'sign_landlord',
                    signature
                })
            });

            if (!response.ok) {
                throw new Error('Failed to sign lease');
            }

            router.push('/dashboard/landlord/leases');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    if (!lease) return <div className="p-4">Lease not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Sign Lease Agreement</h1>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Lease Details</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600">Property</p>
                        <p className="font-medium">{lease.property.name}</p>
                        <p className="text-sm text-gray-500">
                            {lease.property.address.street}, {lease.property.address.city}, {lease.property.address.state} {lease.property.address.zipCode}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600">Tenant</p>
                        <p className="font-medium">{lease.tenant.name}</p>
                        <p className="text-sm text-gray-500">{lease.tenant.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Term</p>
                        <p className="font-medium">
                            {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600">Monthly Rent</p>
                        <p className="font-medium">${lease.rentAmount}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Security Deposit</p>
                        <p className="font-medium">${lease.securityDeposit}</p>
                    </div>
                    {lease.advancedPayment && (
                        <>
                            <div>
                                <p className="text-gray-600">Advanced Payment</p>
                                <p className="font-medium">${lease.advancedPayment.amount}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Due Date</p>
                                <p className="font-medium">{new Date(lease.advancedPayment.dueDate).toLocaleDateString()}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Terms and Conditions</h2>
                <div className="whitespace-pre-wrap">{lease.terms}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Tenant's Signature</h2>
                {lease.tenantSignature ? (
                    <div className="border rounded-lg p-4">
                        <img 
                            src={lease.tenantSignature.signature} 
                            alt="Tenant's signature" 
                            className="max-w-full h-auto"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Signed on: {new Date(lease.tenantSignature.signedAt).toLocaleString()}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-500">Tenant has not signed yet</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Your Signature</h2>
                <div className="border rounded-lg p-4">
                    <SignaturePad
                        ref={(ref) => setSignaturePad(ref)}
                        canvasProps={{
                            className: 'w-full h-48 border rounded'
                        }}
                    />
                    <div className="mt-4 flex justify-end space-x-4">
                        <button
                            onClick={() => signaturePad?.clear()}
                            className="px-4 py-2 border rounded hover:bg-gray-50"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSign}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Sign Lease
                </button>
            </div>
        </div>
    );
} 