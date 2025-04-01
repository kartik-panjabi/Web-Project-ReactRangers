'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Property {
    _id: string;
    name: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    rent: number;
}

interface Application {
    _id: string;
    property: Property;
    tenant: {
        _id: string;
        name: string;
        email: string;
    };
    employmentStatus: string;
    annualIncome: number;
    currentAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    previousLandlord: {
        name: string;
        email: string;
    };
    reasonForMoving: string;
    additionalNotes: string;
    status: string;
}

export default function CreateLease() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [rentAmount, setRentAmount] = useState<string>('');
    const [securityDeposit, setSecurityDeposit] = useState<string>('');
    const [paymentDueDay, setPaymentDueDay] = useState<string>('1');
    const [terms, setTerms] = useState<string>('');
    const [advancedPayment, setAdvancedPayment] = useState<{
        amount: string;
        dueDate: string;
    }>({
        amount: '',
        dueDate: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Fetch properties
                const propertiesResponse = await fetch('/api/properties', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!propertiesResponse.ok) {
                    throw new Error('Failed to fetch properties');
                }

                const propertiesData = await propertiesResponse.json();
                setProperties(propertiesData);

                // Fetch approved applications
                const applicationsResponse = await fetch('/api/applications/landlord', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!applicationsResponse.ok) {
                    throw new Error('Failed to fetch applications');
                }

                const applicationsData = await applicationsResponse.json();
                setApplications(applicationsData.filter((app: Application) => app.status === 'approved'));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const selectedApp = applications.find(app => app._id === selectedApplication);
            if (!selectedApp) {
                throw new Error('No application selected');
            }

            const response = await fetch('/api/leases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    applicationId: selectedApplication,
                    startDate,
                    endDate,
                    rentAmount: parseFloat(rentAmount),
                    securityDeposit: parseFloat(securityDeposit),
                    paymentDueDay: parseInt(paymentDueDay),
                    terms,
                    advancedPayment: advancedPayment.amount ? {
                        amount: parseFloat(advancedPayment.amount),
                        dueDate: advancedPayment.dueDate
                    } : undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create lease');
            }

            router.push('/dashboard/landlord/leases');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Create New Lease</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Approved Application
                    </label>
                    <select
                        value={selectedApplication}
                        onChange={(e) => setSelectedApplication(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="">Select an application</option>
                        {applications.map((app) => (
                            <option key={app._id} value={app._id}>
                                {app.property.name} - {app.tenant.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Rent Amount
                        </label>
                        <input
                            type="number"
                            value={rentAmount}
                            onChange={(e) => setRentAmount(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Security Deposit
                        </label>
                        <input
                            type="number"
                            value={securityDeposit}
                            onChange={(e) => setSecurityDeposit(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Due Day (1-31)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="31"
                        value={paymentDueDay}
                        onChange={(e) => setPaymentDueDay(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Terms and Conditions
                    </label>
                    <textarea
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        className="w-full p-2 border rounded h-32"
                        required
                        placeholder="Enter lease terms and conditions..."
                    />
                </div>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Advanced Payment (Optional)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount
                            </label>
                            <input
                                type="number"
                                value={advancedPayment.amount}
                                onChange={(e) => setAdvancedPayment(prev => ({
                                    ...prev,
                                    amount: e.target.value
                                }))}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={advancedPayment.dueDate}
                                onChange={(e) => setAdvancedPayment(prev => ({
                                    ...prev,
                                    dueDate: e.target.value
                                }))}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Advanced payment is an optional upfront payment that can be requested before the lease starts.
                        This could be used for first month's rent, additional security deposit, or other agreed-upon payments.
                    </p>
                </div>

                <div className="flex justify-end space-x-4">
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
                        Create Lease
                    </button>
                </div>
            </form>
        </div>
    );
} 