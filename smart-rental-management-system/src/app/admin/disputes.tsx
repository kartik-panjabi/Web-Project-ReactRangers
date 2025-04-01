// disputes.tsx
'use client';
import React from 'react';

export default function Disputes() {
    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Manage Disputes</h1>
            <p>List of rental disputes and resolution options.</p>
            <ul className="mt-4 space-y-2">
                <li className="p-4 bg-gray-100 border rounded">Dispute #1 - Pending</li>
                <li className="p-4 bg-gray-100 border rounded">Dispute #2 - Resolved</li>
            </ul>
        </div>
    );
}