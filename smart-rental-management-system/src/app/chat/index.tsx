// index.tsx
'use client';
import React, { useState } from 'react';

export default function Chat() {
    const [messages, setMessages] = useState([
        { id: 1, text: 'Hello! How can I help you?', sender: 'Landlord' },
        { id: 2, text: 'I have a maintenance issue.', sender: 'Tenant' }
    ]);

    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
            setMessages([...messages, { id: messages.length + 1, text: newMessage, sender: 'Tenant' }]);
            setNewMessage('');
        }
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Chat</h1>
            <div className="border p-4 h-64 overflow-auto bg-gray-100 rounded">
                {messages.map((msg) => (
                    <div key={msg.id} className={`p-2 my-1 rounded ${msg.sender === 'Tenant' ? 'bg-blue-200' : 'bg-gray-300'}`}>
                        <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex">
                <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
}