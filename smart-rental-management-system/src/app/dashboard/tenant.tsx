// tenant.tsx
'use client';
import React from 'react';

export default function TenantDashboard() {
    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Tenant Dashboard</h1>
            <p>View lease details, pay rent, and submit maintenance requests.</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-100 border rounded">Next Rent Due: April 1</div>
                <div className="p-4 bg-gray-100 border rounded">Total Paid: $5,000</div>
                <div className="p-4 bg-gray-100 border rounded">Maintenance Requests: 2</div>
            </div>
        </div>
    );
}