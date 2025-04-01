import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import Property from '@/models/Property';

export async function GET(request: Request) {
    try {
        // Verify authentication
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decodedToken = await verifyToken(token);
        if (!decodedToken || decodedToken.role !== 'landlord') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Connect to database
        await connectMongo();

        // Fetch all properties for the landlord
        const properties = await Property.find({ landlord: decodedToken.userId })
            .populate('landlord', 'name email')
            .populate('currentTenant', 'name email')
            .lean();

        if (!properties) {
            return NextResponse.json({ error: 'No properties found' }, { status: 404 });
        }

        return NextResponse.json(properties);
    } catch (error) {
        console.error('Error fetching landlord properties:', error);
        return NextResponse.json(
            { error: 'Failed to fetch properties', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 