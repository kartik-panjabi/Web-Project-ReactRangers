// index.tsx
'use client';
import React, { useState } from 'react';

const mockReviews = [
    { id: 1, reviewer: 'John Doe', rating: 5, comment: 'Great landlord, very responsive!' },
    { id: 2, reviewer: 'Jane Smith', rating: 4, comment: 'Nice apartment but had minor maintenance issues.' },
    { id: 3, reviewer: 'Alice Johnson', rating: 3, comment: 'Average experience, could improve communication.' }
];

export default function Reviews() {
    const [reviews, setReviews] = useState(mockReviews);
    const [newReview, setNewReview] = useState({ reviewer: '', rating: 5, comment: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setReviews([...reviews, { id: reviews.length + 1, ...newReview }]);
        setNewReview({ reviewer: '', rating: 5, comment: '' });
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Tenant & Landlord Reviews</h1>
            <ul className="space-y-2">
                {reviews.map((review) => (
                    <li key={review.id} className="p-4 border rounded bg-gray-100">
                        <strong>{review.reviewer}</strong> - ⭐ {review.rating} <br />
                        {review.comment}
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Your Name"
                    value={newReview.reviewer}
                    onChange={(e) => setNewReview({ ...newReview, reviewer: e.target.value })}
                    required
                />
                <select
                    className="w-full p-2 border rounded"
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                >
                    {[5, 4, 3, 2, 1].map((num) => (
                        <option key={num} value={num}>{num} Stars</option>
                    ))}
                </select>
                <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Your Review"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    required
                ></textarea>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Submit Review</button>
            </form>
        </div>
    );
}