'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface Lease {
    _id: string;
    property: {
        name: string;
        address: string;
    };
    tenant: {
        name: string;
        email: string;
    };
    rentAmount: number;
}

export default function RequestPayment({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [lease, setLease] = useState<Lease | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        amount: 0,
        dueDate: ''
    });
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
                // Set default amount to one month's rent
                setFormData(prev => ({
                    ...prev,
                    amount: data.rentAmount
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchLease();
    }, [resolvedParams.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lease) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`/api/leases/${resolvedParams.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'request_advanced_payment',
                    advancedPayment: formData
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to request payment');
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
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Request Advanced Payment</h1>

            {/* Lease Details */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Lease Details</h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-gray-600">Property</p>
                        <p className="font-medium">{lease.property.name}</p>
                        <p className="text-sm text-gray-500">{lease.property.address}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Tenant</p>
                        <p className="font-medium">{lease.tenant.name}</p>
                        <p className="text-sm text-gray-500">{lease.tenant.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Monthly Rent</p>
                        <p className="font-medium">${lease.rentAmount}</p>
                    </div>
                </div>
            </div>

            {/* Payment Request Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Payment Request</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 border rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Request Payment
                    </button>
                </div>
            </form>
        </div>
    );
} 