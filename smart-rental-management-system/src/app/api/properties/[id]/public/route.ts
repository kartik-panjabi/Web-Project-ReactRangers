import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Property from '@/models/Property';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();
        
        const property = await Property.findOne({
            _id: params.id,
            status: 'available'
        }).select('-landlord -createdAt -updatedAt');

        if (!property) {
            return NextResponse.json(
                { message: 'Property not found or not available' },
                { status: 404 }
            );
        }

        return NextResponse.json(property);
    } catch (error) {
        console.error('Error fetching public property details:', error);
        return NextResponse.json(
            { message: 'Failed to fetch property details' },
            { status: 500 }
        );
    }
} 