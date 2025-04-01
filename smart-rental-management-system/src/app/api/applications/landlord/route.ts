import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Application from '@/models/Application';
import Property from '@/models/Property';

export async function GET(request: Request) {
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

    // Get all properties owned by the landlord
    const properties = await Property.find({ landlord: decoded.userId });
    const propertyIds = properties.map(property => property._id);

    // Get all applications for these properties
    const applications = await Application.find({ property: { $in: propertyIds } })
      .populate('property', 'name rent')
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 