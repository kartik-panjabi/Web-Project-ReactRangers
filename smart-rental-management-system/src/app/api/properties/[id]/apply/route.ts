import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import Property from '@/models/Property';
import Application from '@/models/Application';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'Tenant') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Connect to database
    await connectMongo();

    // Get request body
    const body = await request.json();

    // Validate property exists and is available
    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    if (property.status !== 'available') {
      return NextResponse.json({ message: 'Property is not available' }, { status: 400 });
    }

    // Check if user already has an active application for this property
    const existingApplication = await Application.findOne({
      property: params.id,
      tenant: decoded.userId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: 'You already have an active application for this property' },
        { status: 400 }
      );
    }

    // Create new application
    const application = await Application.create({
      property: params.id,
      tenant: decoded.userId,
      employmentStatus: body.employmentStatus,
      annualIncome: body.annualIncome,
      currentAddress: body.currentAddress,
      previousLandlord: {
        name: body.previousLandlord.name,
        email: body.previousLandlord.email,
        phone: body.previousLandlord.phone
      },
      reasonForMoving: body.reasonForMoving,
      additionalNotes: body.additionalNotes,
      status: 'pending'
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error('Application creation error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 