// listing.tsx
'use client';
import React, { useState } from 'react';

const mockListings = [
    { id: 1, name: 'Luxury Apartment', location: 'Toronto, ON', price: '$2000/month' },
    { id: 2, name: 'Cozy Studio', location: 'Vancouver, BC', price: '$1500/month' },
    { id: 3, name: 'Spacious Condo', location: 'Calgary, AB', price: '$1800/month' }
];

export default function PropertyListing() {
    const [listings] = useState(mockListings);

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Available Properties</h1>
            <ul className="space-y-2">
                {listings.map((listing) => (
                    <li key={listing.id} className="p-4 border rounded bg-gray-100">
                        <strong>{listing.name}</strong> - {listing.location} - {listing.price}
                    </li>
                ))}
            </ul>
        </div>
    );
}