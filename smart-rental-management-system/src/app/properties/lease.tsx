// lease.tsx
'use client';
import React, { useState } from 'react';

export default function LeaseAgreement() {
    const [leaseDetails, setLeaseDetails] = useState({ tenant: '', property: '', duration: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Lease Agreement Created:', leaseDetails);
        setLeaseDetails({ tenant: '', property: '', duration: '' });
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Create Lease Agreement</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Tenant Name"
                    value={leaseDetails.tenant}
                    onChange={(e) => setLeaseDetails({ ...leaseDetails, tenant: e.target.value })}
                    required
                />
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Property Address"
                    value={leaseDetails.property}
                    onChange={(e) => setLeaseDetails({ ...leaseDetails, property: e.target.value })}
                    required
                />
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Lease Duration (months)"
                    value={leaseDetails.duration}
                    onChange={(e) => setLeaseDetails({ ...leaseDetails, duration: e.target.value })}
                    required
                />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Create Lease</button>
            </form>
        </div>
    );
}