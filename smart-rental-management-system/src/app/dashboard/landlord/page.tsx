// landlord.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ChatNotification from '@/components/ChatNotification';
import { verifyToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Property {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  rent: number;
  status: string;
  currentTenant?: {
    name: string;
    email: string;
  };
}

interface LandlordDashboardData {
  properties: Property[];
  totalProperties: number;
  rentedProperties: number;
  availableProperties: number;
  totalRevenue: number;
  profile: {
    name: string;
    email: string;
    phone: string;
  };
}

const LandlordDashboard = () => {
  const [dashboardData, setDashboardData] = useState<LandlordDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Get user ID from token
        const decodedToken = await verifyToken(token);
        if (decodedToken) {
          setUserId(decodedToken.userId);
        }

        const response = await fetch('/api/dashboard/landlord', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Landlord Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {dashboardData?.profile.name}</span>
            <Link href="/properties/add" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add New Property
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Total Properties</h3>
            <p className="text-3xl font-bold">{dashboardData?.totalProperties}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Rented Properties</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardData?.rentedProperties}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Available Properties</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboardData?.availableProperties}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-500 text-sm">Total Monthly Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">${dashboardData?.totalRevenue}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Properties List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Properties</h2>
              <div className="flex space-x-4">
                <Link href="/dashboard/landlord/applications" className="text-blue-500 hover:underline">
                  View Applications →
                </Link>
                <Link href="/dashboard/landlord/leases" className="text-blue-500 hover:underline">
                  Manage Leases →
                </Link>
                <Link href="/properties" className="text-blue-500 hover:underline">
                  View All →
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData?.properties.map((property) => (
                <div key={property._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{property.name}</h3>
                      <p className="text-gray-600">
                        {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
                      </p>
                      <p className="text-gray-600">Rent: ${property.rent}/month</p>
                      {property.currentTenant && (
                        <p className="text-gray-600">
                          Current Tenant: {property.currentTenant.name}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      property.status === 'rented' ? 'bg-green-100 text-green-800' :
                      property.status === 'available' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Link href={`/properties/${property._id}`} className="text-blue-500 hover:underline text-sm">
                      View Details →
                    </Link>
                    <Link href={`/properties/${property._id}/edit`} className="text-green-500 hover:underline text-sm">
                      Edit →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Notification */}
          {userId && <ChatNotification userId={userId} role="Landlord" />}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <Link href="/properties/add" className="block w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center">
                Add New Property
              </Link>
              <Link href="/dashboard/landlord/applications" className="block w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 text-center">
                View Applications
              </Link>
              <Link href="/dashboard/landlord/leases" className="block w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 text-center">
                Manage Leases
              </Link>
              <Link href="/maintenance" className="block w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 text-center">
                View Maintenance Requests
              </Link>
              <Link href="/payments" className="block w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 text-center">
                View Payments
              </Link>
              <Link href="/tenants" className="block w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 text-center">
                Manage Tenants
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm text-green-800">New tenant application received for 123 Main St</p>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">Rent payment received from John Doe</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded">
                <p className="text-sm text-yellow-800">Maintenance request submitted for 456 Oak Ave</p>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <p className="text-sm text-purple-800">New message from tenant at 789 Pine St</p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {dashboardData?.profile.name}</p>
              <p><span className="font-medium">Email:</span> {dashboardData?.profile.email}</p>
              <p><span className="font-medium">Phone:</span> {dashboardData?.profile.phone}</p>
            </div>
            <Link href="/profile" className="text-blue-500 hover:underline mt-4 block">
              Edit Profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
