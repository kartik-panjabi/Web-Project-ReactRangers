// track.tsx
'use client';
import React, { useState } from 'react';

const mockRequests = [
    { id: 1, issue: 'Leaking faucet', status: 'Pending' },
    { id: 2, issue: 'Broken heater', status: 'In Progress' },
    { id: 3, issue: 'Electrical issue', status: 'Resolved' }
];

export default function TrackMaintenance() {
    const [requests] = useState(mockRequests);

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Track Maintenance Requests</h1>
            <ul className="space-y-2">
                {requests.map((req) => (
                    <li key={req.id} className={`p-4 rounded ${req.status === 'Pending' ? 'bg-yellow-200' : req.status === 'In Progress' ? 'bg-blue-200' : 'bg-green-200'}`}>
                        <strong>{req.issue}</strong> - {req.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}