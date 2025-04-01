// Table.tsx
'use client';
import React from 'react';

export default function Table({ headers, data }: { headers: string[]; data: any[] }) {
    return (
        <table className="w-full border-collapse border border-gray-300">
            <thead>
            <tr className="bg-gray-200">
                {headers.map((header, index) => (
                    <th key={index} className="border p-2">{header}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="text-center">
                    {headers.map((header, colIndex) => (
                        <td key={colIndex} className="border p-2">{row[header]}</td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}