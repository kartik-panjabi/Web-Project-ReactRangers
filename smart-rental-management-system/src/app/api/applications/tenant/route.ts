import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Application from '@/models/Application';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    try {
        // Verify authentication
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'Tenant') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Connect to database
        await connectToDatabase();

        // Ensure Application model is registered
        if (!mongoose.models.Application) {
            mongoose.model('Application', Application.schema);
        }

        // Fetch applications for the tenant
        const applications = await Application.find({ tenant: decoded.userId })
            .populate('property')
            .sort({ createdAt: -1 });

        return NextResponse.json(applications);
    } catch (error) {
        console.error('Error fetching tenant applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
} 