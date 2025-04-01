import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User, { UserSchema } from '@/models/User';
import Property from '@/models/Property';
import mongoose from 'mongoose';
import Application from '@/models/Application';

// Valid property types
const validPropertyTypes = ['apartment', 'house', 'condo', 'townhouse'];
// Valid status values
const validStatusValues = ['available', 'rented', 'maintenance', 'reserved'];
// Valid amenities
const validAmenities = [
  'parking',
  'pool',
  'gym',
  'elevator',
  'security',
  'furnished',
  'pet-friendly',
  'laundry',
  'air-conditioning',
  'heating'
];

// Register User model if not already registered
if (!mongoose.models.User) {
  mongoose.model('User', UserSchema);
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
    console.log('Received property data:', body);

    // Validate property type
    if (!validPropertyTypes.includes(body.propertyType)) {
      return NextResponse.json(
        { error: `Invalid property type. Must be one of: ${validPropertyTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate amenities
    const invalidAmenities = body.amenities?.filter((amenity: string) => !validAmenities.includes(amenity));
    if (invalidAmenities?.length > 0) {
      return NextResponse.json(
        { error: `Invalid amenities: ${invalidAmenities.join(', ')}` },
        { status: 400 }
      );
    }

    // Transform the data to match the schema
    const propertyData = {
      name: body.name,
      address: {
        street: body.address.street,
        city: body.address.city,
        state: body.address.state,
        zipCode: body.address.zipCode,
        country: body.address.country
      },
      propertyType: body.propertyType,
      rent: Number(body.rent),
      bedrooms: Number(body.bedrooms),
      bathrooms: Number(body.bathrooms),
      squareFootage: Number(body.squareFootage),
      description: body.description,
      amenities: body.amenities || [],
      images: body.images || ['https://placehold.co/600x400'],
      status: 'available',
      landlord: decoded.userId
    };

    console.log('Transformed property data:', propertyData);

    // Create new property
    const property = await Property.create(propertyData);
    console.log('Created property:', property);

    return NextResponse.json(property, { status: 201 });
  } catch (error: any) {
    console.error('Property creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Connect to database
    await connectToDatabase();

    // Ensure Property model is registered
    if (!mongoose.models.Property) {
      mongoose.model('Property', Property.schema);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const propertyType = searchParams.get('propertyType');
    const minRent = searchParams.get('minRent');
    const maxRent = searchParams.get('maxRent');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');

    // Build query
    const query: any = { status: 'available' };

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (minRent) {
      query.rent = { ...query.rent, $gte: Number(minRent) };
    }

    if (maxRent) {
      query.rent = { ...query.rent, $lte: Number(maxRent) };
    }

    if (bedrooms) {
      query.bedrooms = Number(bedrooms);
    }

    if (bathrooms) {
      query.bathrooms = Number(bathrooms);
    }

    // Get all properties that match the query
    const properties = await Property.find(query)
      .populate('landlord', 'name email')
      .populate('currentTenant', 'name email');

    // Get all approved applications
    const approvedApplications = await Application.find({ status: 'approved' })
      .select('property');

    // Create a set of property IDs that have approved applications
    const rentedPropertyIds = new Set(approvedApplications.map(app => app.property.toString()));

    // Filter out properties that are rented or have approved applications
    const availableProperties = properties.filter(property => 
      property.status === 'available' && 
      !rentedPropertyIds.has(property._id.toString())
    );

    return NextResponse.json(availableProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
} 