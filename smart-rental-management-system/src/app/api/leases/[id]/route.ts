import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Lease from '@/models/Lease';
import mongoose from 'mongoose';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        console.log('Decoded token:', {
            userId: decoded.userId,
            role: decoded.role
        });

        // Connect to database
        await connectToDatabase();

        // Await params
        const resolvedParams = await params;

        // Verify lease ID is valid
        if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
            return NextResponse.json({ error: 'Invalid lease ID' }, { status: 400 });
        }

        // Fetch lease
        const lease = await Lease.findById(resolvedParams.id)
            .populate('property')
            .populate('tenant', 'name email')
            .populate('landlord', 'name email');

        if (!lease) {
            return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
        }

        console.log('Lease data:', {
            leaseId: lease._id,
            tenantId: lease.tenant._id,
            landlordId: lease.landlord._id,
            status: lease.status
        });

        // Verify user has access to this lease
        if (decoded.role === 'Landlord' && lease.landlord._id.toString() !== decoded.userId) {
            console.log('Landlord access denied:', {
                leaseLandlordId: lease.landlord._id.toString(),
                userId: decoded.userId
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        if (decoded.role === 'Tenant' && lease.tenant._id.toString() !== decoded.userId) {
            console.log('Tenant access denied:', {
                leaseTenantId: lease.tenant._id.toString(),
                userId: decoded.userId
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json(lease);
    } catch (error) {
        console.error('Error fetching lease:', error);
        return NextResponse.json(
            { error: 'Failed to fetch lease' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Await params
        const resolvedParams = await params;

        // Verify lease ID is valid
        if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
            return NextResponse.json({ error: 'Invalid lease ID' }, { status: 400 });
        }

        // Get request body
        const body = await request.json();
        const { action, signature } = body;

        // Fetch lease
        const lease = await Lease.findById(resolvedParams.id);
        if (!lease) {
            return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
        }

        // Verify user has access to this lease
        if (decoded.role === 'Landlord' && lease.landlord.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        if (decoded.role === 'Tenant' && lease.tenant.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Handle different actions
        switch (action) {
            case 'sign_tenant':
                if (decoded.role !== 'Tenant') {
                    return NextResponse.json({ error: 'Only tenants can sign leases' }, { status: 403 });
                }
                if (lease.status !== 'pending_tenant_signature') {
                    return NextResponse.json({ error: 'Lease is not ready for tenant signature' }, { status: 400 });
                }
                lease.tenantSignature = signature;
                lease.status = 'pending_landlord_signature';
                break;

            case 'sign_landlord':
                if (decoded.role !== 'Landlord') {
                    return NextResponse.json({ error: 'Only landlords can sign leases' }, { status: 403 });
                }
                if (lease.status !== 'pending_landlord_signature') {
                    return NextResponse.json({ error: 'Tenant must sign first' }, { status: 400 });
                }
                lease.landlordSignature = signature;
                lease.status = 'active';
                break;

            case 'request_advanced_payment':
                if (decoded.role !== 'Landlord') {
                    return NextResponse.json({ error: 'Only landlords can request advanced payments' }, { status: 403 });
                }
                if (lease.status !== 'active') {
                    return NextResponse.json({ error: 'Lease must be active' }, { status: 400 });
                }
                lease.advancedPayment = {
                    amount: lease.rentAmount * 2,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    status: 'pending'
                };
                break;

            case 'pay_advanced_payment':
                if (decoded.role !== 'Tenant') {
                    return NextResponse.json({ error: 'Only tenants can pay advanced payments' }, { status: 403 });
                }
                if (!lease.advancedPayment || lease.advancedPayment.status !== 'pending') {
                    return NextResponse.json({ error: 'No pending advanced payment' }, { status: 400 });
                }
                lease.advancedPayment.status = 'paid';
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Save changes
        await lease.save();

        return NextResponse.json(lease);
    } catch (error) {
        console.error('Error updating lease:', error);
        return NextResponse.json(
            { error: 'Failed to update lease' },
            { status: 500 }
        );
    }
} 