import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import Message from '@/models/Message';

export async function GET(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectMongo();

        // Count unread messages for the user
        const count = await Message.countDocuments({
            receiver: decoded.userId,
            read: false
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching unread messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unread messages' },
            { status: 500 }
        );
    }
} 