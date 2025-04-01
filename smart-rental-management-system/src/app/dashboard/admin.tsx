// admin.tsx
'use client';
import React from 'react';

export default function AdminDashboard() {
    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p>Manage users, view analytics, and oversee platform operations.</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-100 border rounded">Total Users: 120</div>
                <div className="p-4 bg-gray-100 border rounded">Active Disputes: 5</div>
                <div className="p-4 bg-gray-100 border rounded">Revenue: $50,000</div>
            </div>
        </div>
    );
}