import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Application from '@/models/Application';
import Property from '@/models/Property';

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

    // Get request body
    const { status } = await request.json();

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Fetch application
    const application = await Application.findById(params.id)
      .populate('property');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify landlord owns the property
    const property = application.property as any;
    if (property.landlord.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update application status
    application.status = status;
    await application.save();

    // If approved, update property status and assign tenant
    if (status === 'approved') {
      await Property.findByIdAndUpdate(property._id, {
        status: 'rented',
        currentTenant: application.tenant
      });
    }

    return NextResponse.json(application);
  } catch (error: any) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Connect to database
    await connectToDatabase();

    // Fetch application
    const application = await Application.findById(params.id);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify user is either the tenant or the landlord
    if (
      decoded.role === 'Tenant' && application.tenant.toString() !== decoded.userId ||
      decoded.role === 'Landlord' && application.property.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update application status to withdrawn
    application.status = 'withdrawn';
    await application.save();

    return NextResponse.json({ message: 'Application withdrawn successfully' });
  } catch (error: any) {
    console.error('Application withdrawal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 