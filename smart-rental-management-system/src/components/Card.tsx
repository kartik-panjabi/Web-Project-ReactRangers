// Card.tsx
'use client';
import React from 'react';

export default function Card({ title, content }: { title: string; content: string }) {
    return (
        <div className="p-4 bg-white shadow-md rounded-lg border border-gray-300">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-gray-700">{content}</p>
        </div>
    );
}