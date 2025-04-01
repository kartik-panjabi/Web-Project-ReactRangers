// notifications.tsx
'use client';
import React, { useState } from 'react';

export default function Notifications() {
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Rent payment due in 3 days', type: 'warning' },
        { id: 2, text: 'New maintenance request received', type: 'info' }
    ]);

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            <ul className="space-y-2">
                {notifications.map((notification) => (
                    <li key={notification.id} className={`p-4 rounded ${notification.type === 'warning' ? 'bg-yellow-200' : 'bg-blue-200'}`}>
                        {notification.text}
                    </li>
                ))}
            </ul>
        </div>
    );
}