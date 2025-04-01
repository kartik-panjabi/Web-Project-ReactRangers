// users.tsx
'use client';
import React from 'react';

export default function Users() {
    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            <p>Approve, reject, or manage landlords and tenants.</p>
            <ul className="mt-4 space-y-2">
                <li className="p-4 bg-gray-100 border rounded">User 1 - Landlord - Approved</li>
                <li className="p-4 bg-gray-100 border rounded">User 2 - Tenant - Pending</li>
            </ul>
        </div>
    );
}