import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import Property from '@/models/Property';
import Payment from '@/models/Payment';
import MaintenanceRequest from '@/models/MaintenanceRequest';

export async function GET(request: Request) {
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

    // Fetch user data
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch property data
    const property = await Property.findOne({ currentTenant: user._id });
    
    // Initialize dashboard data with user profile
    const dashboardData = {
      property: property ? {
        _id: property._id,
        name: property.name,
        address: property.address,
        rent: property.rent,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
      } : null,
      payments: {
        lastPayment: null,
        upcomingPayment: property ? {
          amount: property.rent,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
        } : null
      },
      maintenanceRequests: {
        pending: 0,
        completed: 0
      },
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    };

    // If property exists, fetch additional data
    if (property) {
      // Fetch payment data
      const lastPayment = await Payment.findOne({ 
        tenant: user._id, 
        property: property._id 
      }).sort({ date: -1 });

      if (lastPayment) {
        dashboardData.payments.lastPayment = {
          amount: lastPayment.amount,
          date: lastPayment.date.toISOString().split('T')[0],
          status: lastPayment.status
        };
      }

      // Fetch maintenance requests
      const maintenanceRequests = await MaintenanceRequest.find({ 
        tenant: user._id, 
        property: property._id 
      });

      dashboardData.maintenanceRequests = {
        pending: maintenanceRequests.filter(req => req.status === 'pending').length,
        completed: maintenanceRequests.filter(req => req.status === 'completed').length
      };
    }

    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error('Tenant dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 