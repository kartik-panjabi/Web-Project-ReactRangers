// request.tsx
'use client';
import React, { useState } from 'react';

export default function MaintenanceRequest() {
    const [request, setRequest] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Maintenance Request Submitted:', request);
        setRequest('');
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Submit Maintenance Request</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
            className="w-full p-2 border rounded"
            placeholder="Describe the issue..."
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            required
        ></textarea>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Submit Request</button>
            </form>
        </div>
    );
}