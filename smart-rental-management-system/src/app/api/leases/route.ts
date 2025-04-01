import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Lease from '@/models/Lease';
import Property from '@/models/Property';
import Application from '@/models/Application';
import User from '@/models/User';
import mongoose from 'mongoose';

// Ensure User model is registered
if (!mongoose.models.User) {
    mongoose.model('User', User.schema);
}

interface LeaseData {
    property: mongoose.Types.ObjectId;
    tenant: mongoose.Types.ObjectId;
    landlord: string;
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    securityDeposit: number;
    paymentDueDay: number;
    terms: string;
    status: string;
    advancedPayment?: {
        amount: number;
        dueDate: Date;
        status: string;
    };
}

export async function POST(request: Request) {
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

        // Get request body
        const body = await request.json();
        const { 
            applicationId, 
            startDate, 
            endDate, 
            rentAmount, 
            securityDeposit, 
            paymentDueDay, 
            terms,
            advancedPayment 
        } = body;

        // Fetch the approved application
        const application = await Application.findById(applicationId)
            .populate('property')
            .populate('tenant');

        if (!application || application.status !== 'approved') {
            return NextResponse.json(
                { error: 'Application not found or not approved' },
                { status: 404 }
            );
        }

        // Verify property ownership
        if (application.property.landlord.toString() !== decoded.userId) {
            return NextResponse.json(
                { error: 'Not authorized to create lease for this property' },
                { status: 403 }
            );
        }

        // Create lease with advanced payment if provided
        const leaseData: LeaseData = {
            property: application.property._id,
            tenant: application.tenant._id,
            landlord: decoded.userId,
            startDate,
            endDate,
            rentAmount,
            securityDeposit,
            paymentDueDay,
            terms,
            status: 'pending_tenant_signature'
        };

        // Add advanced payment if provided
        if (advancedPayment && advancedPayment.amount) {
            leaseData.advancedPayment = {
                amount: advancedPayment.amount,
                dueDate: new Date(advancedPayment.dueDate),
                status: 'pending'
            };
        }

        // Validate payment due day
        if (leaseData.paymentDueDay < 1 || leaseData.paymentDueDay > 31) {
            return NextResponse.json(
                { error: 'Payment due day must be between 1 and 31' },
                { status: 400 }
            );
        }

        // Create lease
        const lease = await Lease.create(leaseData);

        // Update property status
        await Property.findByIdAndUpdate(application.property._id, {
            status: 'reserved',
            currentTenant: application.tenant._id
        });

        return NextResponse.json(lease);
    } catch (error) {
        console.error('Error creating lease:', error);
        return NextResponse.json(
            { error: 'Failed to create lease' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        // Verify authentication
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Connect to database
        await connectToDatabase();

        // Build query based on user role
        const query: any = {};
        if (decoded.role === 'Landlord') {
            query.landlord = decoded.userId;
        } else if (decoded.role === 'Tenant') {
            query.tenant = decoded.userId;
        }

        // Fetch leases
        const leases = await Lease.find(query)
            .populate('property')
            .populate('tenant', 'name email')
            .populate('landlord', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(leases);
    } catch (error) {
        console.error('Error fetching leases:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leases' },
            { status: 500 }
        );
    }
} 