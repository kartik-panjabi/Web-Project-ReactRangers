'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Lease {
    _id: string;
    property: {
        name: string;
        address: string;
    };
    advancedPayment: {
        amount: number;
        dueDate: string;
        status: string;
    };
}

export default function LeasePayment({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const router = useRouter();
    const [lease, setLease] = useState<Lease | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lease) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Here you would typically integrate with a payment processor
            // For now, we'll just simulate a successful payment
            const response = await fetch(`/api/leases/${resolvedParams.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'pay_advanced_payment'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process payment');
            }

            router.push('/dashboard/tenant/leases');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    if (!lease) return <div className="p-4">Lease not found</div>;
    if (!lease.advancedPayment) return <div className="p-4">No advanced payment required</div>;
    if (lease.advancedPayment.status === 'paid') return <div className="p-4">Payment already completed</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Advanced Payment</h1>

            {/* Payment Details */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-gray-600">Property</p>
                        <p className="font-medium">{lease.property.name}</p>
                        <p className="text-sm text-gray-500">{lease.property.address}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Amount Due</p>
                        <p className="font-medium">${lease.advancedPayment.amount}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Due Date</p>
                        <p className="font-medium">{new Date(lease.advancedPayment.dueDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                    </label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="credit_card">Credit Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                    </select>
                </div>

                {paymentMethod === 'credit_card' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Card Number
                            </label>
                            <input
                                type="text"
                                value={cardDetails.number}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="1234 5678 9012 3456"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry Date
                                </label>
                                <input
                                    type="text"
                                    value={cardDetails.expiry}
                                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="MM/YY"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CVV
                                </label>
                                <input
                                    type="text"
                                    value={cardDetails.cvv}
                                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="123"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cardholder Name
                            </label>
                            <input
                                type="text"
                                value={cardDetails.name}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-600">Bank Account Details</p>
                            <p className="font-medium">Account Name: Smart Rental Management</p>
                            <p className="font-medium">Account Number: 1234567890</p>
                            <p className="font-medium">Bank: Example Bank</p>
                            <p className="font-medium">Routing Number: 987654321</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Please include your lease ID ({resolvedParams.id}) in the transfer reference.
                            </p>
                        </div>
                    </div>
                )}

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
                        Pay ${lease.advancedPayment.amount}
                    </button>
                </div>
            </form>
        </div>
    );
} 