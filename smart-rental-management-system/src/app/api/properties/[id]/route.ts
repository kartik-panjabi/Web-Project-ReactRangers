import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Property from '@/models/Property';
import Application from '@/models/Application';
import mongoose from 'mongoose';
import { connectMongo } from '@/lib/mongodb';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectMongo();

        const resolvedParams = await params;

        // Fetch property by ID
        const property = await Property.findById(resolvedParams.id)
            .populate('landlord', 'name email')
            .populate('currentTenant', 'name email');

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        return NextResponse.json(property);
    } catch (error) {
        console.error('Error fetching property:', error);
        return NextResponse.json(
            { error: 'Failed to fetch property' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'Landlord') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Connect to database
        await connectToDatabase();

        // Ensure Property model is registered
        if (!mongoose.models.Property) {
            mongoose.model('Property', Property.schema);
        }

        // Get request body
        const body = await request.json();
        const { status } = body;

        // Validate status
        if (!['available', 'rented', 'maintenance', 'reserved'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Fetch property
        const property = await Property.findById(params.id);
        if (!property) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (property.landlord.toString() !== decoded.userId) {
            return NextResponse.json(
                { error: 'Not authorized to update this property' },
                { status: 403 }
            );
        }

        // Update property status
        property.status = status;
        await property.save();

        return NextResponse.json(property);
    } catch (error) {
        console.error('Error updating property:', error);
        return NextResponse.json(
            { error: 'Failed to update property' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'Landlord') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Connect to database
        await connectToDatabase();

        // Ensure Property model is registered
        if (!mongoose.models.Property) {
            mongoose.model('Property', Property.schema);
        }

        // Fetch property
        const property = await Property.findById(params.id);
        if (!property) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (property.landlord.toString() !== decoded.userId) {
            return NextResponse.json(
                { error: 'Not authorized to delete this property' },
                { status: 403 }
            );
        }

        // Delete property
        await property.deleteOne();

        return NextResponse.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json(
            { error: 'Failed to delete property' },
            { status: 500 }
        );
    }
} 