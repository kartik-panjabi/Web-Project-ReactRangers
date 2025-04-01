// index.tsx
'use client';
import React, { useState } from 'react';

export default function Payments() {
    const [amount, setAmount] = useState('');

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Payment Submitted:', amount);
        setAmount('');
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Make a Payment</h1>
            <form onSubmit={handlePayment} className="space-y-4">
                <input
                    type="number"
                    className="w-full p-2 border rounded"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Pay Now</button>
            </form>
        </div>
    );
}