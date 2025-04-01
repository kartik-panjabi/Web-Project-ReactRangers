import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Property from '@/models/Property';
import User from '@/models/User';

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

    // Get landlord's profile
    const landlord = await User.findById(decoded.userId).select('name email phone');
    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 });
    }

    // Get landlord's properties
    const properties = await Property.find({ landlord: decoded.userId })
      .populate('currentTenant', 'name email')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalProperties = properties.length;
    const rentedProperties = properties.filter(p => p.status === 'rented').length;
    const availableProperties = properties.filter(p => p.status === 'available').length;
    const totalRevenue = properties
      .filter(p => p.status === 'rented')
      .reduce((sum, p) => sum + p.rent, 0);

    return NextResponse.json({
      properties,
      totalProperties,
      rentedProperties,
      availableProperties,
      totalRevenue,
      profile: {
        name: landlord.name,
        email: landlord.email,
        phone: landlord.phone
      }
    });
  } catch (error: any) {
    console.error('Landlord dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 