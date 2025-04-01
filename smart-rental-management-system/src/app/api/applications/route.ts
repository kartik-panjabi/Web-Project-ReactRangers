import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Application from '@/models/Application';
import Property from '@/models/Property';

export async function POST(request: Request) {
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

    // Get request body
    const body = await request.json();
    const { propertyId, ...applicationData } = body;

    // Check if property exists and is available
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.status !== 'available') {
      return NextResponse.json(
        { error: 'Property is not available for applications' },
        { status: 400 }
      );
    }

    // Check if tenant has already applied
    const existingApplication = await Application.findOne({
      property: propertyId,
      tenant: decoded.userId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this property' },
        { status: 400 }
      );
    }

    // Create new application
    const application = await Application.create({
      ...applicationData,
      property: propertyId,
      tenant: decoded.userId,
      status: 'pending'
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error('Application creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Connect to database
    await connectToDatabase();

    // Build query based on user role
    const query: any = {};
    if (decoded.role === 'Tenant') {
      query.tenant = decoded.userId;
    } else if (decoded.role === 'Landlord') {
      const properties = await Property.find({ landlord: decoded.userId });
      query.property = { $in: properties.map(p => p._id) };
    }

    // Fetch applications
    const applications = await Application.find(query)
      .populate('property', 'name rent')
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error('Application fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 