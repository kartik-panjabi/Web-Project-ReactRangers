// history.tsx
'use client';
import React, { useState } from 'react';

const mockPayments = [
    { id: 1, date: '2024-03-01', amount: '$1200', status: 'Paid' },
    { id: 2, date: '2024-02-01', amount: '$1200', status: 'Paid' },
    { id: 3, date: '2024-01-01', amount: '$1200', status: 'Late' }
];

export default function PaymentHistory() {
    const [payments] = useState(mockPayments);

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Payment History</h1>
            <ul className="space-y-2">
                {payments.map((payment) => (
                    <li key={payment.id} className={`p-4 rounded ${payment.status === 'Paid' ? 'bg-green-200' : 'bg-red-200'}`}>
                        <strong>{payment.date}</strong> - {payment.amount} - {payment.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}