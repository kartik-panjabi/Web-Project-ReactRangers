import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Lease from '@/models/Lease';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decodedToken = await verifyToken(token);
        if (!decodedToken || decodedToken.role !== 'Tenant') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectMongo();

        const leases = await Lease.find({ tenant: decodedToken.userId })
            .populate('property', 'name address')
            .populate('landlord', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(leases);
    } catch (error) {
        console.error('Error fetching tenant leases:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leases' },
            { status: 500 }
        );
    }
} 