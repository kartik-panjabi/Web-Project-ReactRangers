import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ChatNotificationProps {
    userId: string;
    role: 'Tenant' | 'Landlord';
}

interface Message {
    _id: string;
    sender: string;
    receiver: string;
    content: string;
    read: boolean;
    createdAt: string;
}

export default function ChatNotification({ userId, role }: ChatNotificationProps) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch('/api/messages/unread', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch unread messages');
                }

                const data = await response.json();
                setUnreadCount(data.count);
            } catch (error) {
                console.error('Error fetching unread messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUnreadMessages();
        // Set up polling every 30 seconds
        const interval = setInterval(fetchUnreadMessages, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Messages</h2>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Messages</h2>
                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </div>
            <Link 
                href="/chat" 
                className="text-blue-500 hover:underline flex items-center"
            >
                View Messages
                <svg 
                    className="w-4 h-4 ml-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                    />
                </svg>
            </Link>
        </div>
    );
} 