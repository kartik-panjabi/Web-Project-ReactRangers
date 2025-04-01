'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    status: string;
    advancedPayment?: {
        amount: number;
        dueDate: string;
        status: string;
    };
}

export default function LandlordLeasesPage() {
    const router = useRouter();
    const [leases, setLeases] = useState<Lease[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatAddress = (address: Lease['property']['address']) => {
        return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
    };

    useEffect(() => {
        const fetchLeases = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch('/api/leases/landlord', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch leases');
                }

                const data = await response.json();
                setLeases(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchLeases();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending_tenant_signature':
            case 'pending_landlord_signature':
                return 'bg-yellow-100 text-yellow-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            case 'terminated':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAction = (lease: Lease) => {
        if (lease.status === 'pending_tenant_signature') {
            router.push(`/dashboard/landlord/leases/${lease._id}/sign`);
        } else if (lease.status === 'active' && !lease.advancedPayment) {
            router.push(`/dashboard/landlord/leases/${lease._id}/request-payment`);
        } else if (lease.status === 'active') {
            router.push(`/dashboard/landlord/leases/${lease._id}`);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Leases</h1>
                <button
                    onClick={() => router.push('/dashboard/landlord/leases/create')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Create New Lease
                </button>
            </div>

            <div className="grid gap-6">
                {leases.map((lease) => (
                    <div key={lease._id} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">{lease.property.name}</h2>
                                <p className="text-gray-600 mb-2">{formatAddress(lease.property.address)}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-600">Start Date</p>
                                        <p className="font-medium">{new Date(lease.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">End Date</p>
                                        <p className="font-medium">{new Date(lease.endDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Rent Amount</p>
                                        <p className="font-medium">${lease.rentAmount}/month</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(lease.status)}`}>
                                            {lease.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-600">Tenant</p>
                                <p className="font-medium">{lease.tenant.name}</p>
                                <p className="text-sm text-gray-500">{lease.tenant.email}</p>
                            </div>
                        </div>

                        {lease.advancedPayment && (
                            <div className="mt-4 p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold mb-2">Advanced Payment</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-600">Amount</p>
                                        <p className="font-medium">${lease.advancedPayment.amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Due Date</p>
                                        <p className="font-medium">
                                            {new Date(lease.advancedPayment.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                                            lease.advancedPayment.status === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : lease.advancedPayment.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {lease.advancedPayment.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => handleAction(lease)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {lease.status === 'pending_tenant_signature' ? 'Sign Lease' :
                                 lease.status === 'active' && !lease.advancedPayment ? 'Request Payment' :
                                 'View Details'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 