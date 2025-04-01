import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Property from '@/models/Property';

export async function GET() {
    try {
        await connectMongo();
        
        // Log the query conditions
        console.log('Fetching public properties with conditions:', {
            status: 'available'
        });
        
        // Fetch only available properties
        const properties = await Property.find({
            status: 'available'
        }).select('-landlord -createdAt -updatedAt');

        // Log the number of properties found
        console.log(`Found ${properties.length} public properties`);

        // If no properties found, let's check if there are any properties at all
        if (properties.length === 0) {
            const allProperties = await Property.find({});
            console.log(`Total properties in database: ${allProperties.length}`);
            
            // Log the status distribution
            const statusCount = await Property.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);
            console.log('Properties by status:', statusCount);
        }

        return NextResponse.json(properties);
    } catch (error) {
        console.error('Error fetching public properties:', error);
        return NextResponse.json(
            { message: 'Failed to fetch properties' },
            { status: 500 }
        );
    }
} 