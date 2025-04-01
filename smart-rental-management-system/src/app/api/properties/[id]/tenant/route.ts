import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import Property from '@/models/Property';

interface PropertyWithLandlord {
    _id: string;
    landlord: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        password?: string;
        role?: string;
    };
    [key: string]: any;
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Get token from header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token);

        if (!decoded || decoded.role !== 'Tenant') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate property ID
        if (!params.id || params.id === 'undefined') {
            return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
        }

        // Connect to database
        await connectMongo();

        // Find property and verify tenant has access
        const property = await Property.findOne({
            _id: params.id,
            currentTenant: decoded.userId
        });

        if (!property) {
            return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
        }

        // Remove sensitive information from landlord object
        const propertyData = property.toObject();
        if (propertyData.landlord) {
            delete propertyData.landlord.password;
        }

        return NextResponse.json(propertyData);
    } catch (error: any) {
        console.error('Error fetching property:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ error: 'Invalid property ID format' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 