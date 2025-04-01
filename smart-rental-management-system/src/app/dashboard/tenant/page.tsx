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
    bedrooms: number;
    bathrooms: number;
    propertyType: string;
    status: string;
    landlord: {
        name: string;
        email: string;
    };
}

interface Application {
    _id: string;
    property: Property;
    status: string;
    createdAt: string;
}

interface TenantDashboardData {
    profile: {
        name: string;
        email: string;
        phone: string;
    };
    property: Property | null;
    payments: {
        lastPayment: {
            amount: number;
            date: string;
            status: string;
        } | null;
        upcomingPayment: {
            amount: number;
            dueDate: string;
        } | null;
    };
    maintenanceRequests: {
        pending: number;
        completed: number;
    };
}

export default function TenantDashboard() {
    const [dashboardData, setDashboardData] = useState<TenantDashboardData | null>(null);
    const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
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

                // Fetch dashboard data
                console.log('Fetching dashboard data...');
                const dashboardResponse = await fetch('/api/dashboard/tenant', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Dashboard response status:', dashboardResponse.status);
                
                if (!dashboardResponse.ok) {
                    const errorData = await dashboardResponse.json();
                    console.error('Dashboard error:', errorData);
                    throw new Error('Failed to fetch dashboard data');
                }
                const dashboardData = await dashboardResponse.json();
                console.log('=== DASHBOARD DATA ===');
                console.log('Full Dashboard Data:', JSON.stringify(dashboardData, null, 2));
                console.log('Property:', JSON.stringify(dashboardData.property, null, 2));
                console.log('Property ID:', dashboardData.property?._id);
                console.log('Has Property:', !!dashboardData.property);
                console.log('=====================');
                setDashboardData(dashboardData);

                // Fetch available properties
                console.log('Fetching properties...');
                const propertiesResponse = await fetch('/api/properties', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Properties response status:', propertiesResponse.status);
                
                if (!propertiesResponse.ok) {
                    const errorData = await propertiesResponse.json();
                    console.error('Properties error:', errorData);
                    throw new Error('Failed to fetch properties');
                }
                const propertiesData = await propertiesResponse.json();
                setAvailableProperties(propertiesData);

                // Fetch tenant's applications
                console.log('Fetching applications...');
                const applicationsResponse = await fetch('/api/applications/tenant', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Applications response status:', applicationsResponse.status);
                
                if (!applicationsResponse.ok) {
                    const errorData = await applicationsResponse.json();
                    console.error('Applications error:', errorData);
                    throw new Error('Failed to fetch applications');
                }
                const applicationsData = await applicationsResponse.json();
                console.log('=== APPLICATIONS DATA ===');
                console.log('Full Applications:', JSON.stringify(applicationsData, null, 2));
                console.log('Approved Applications:', JSON.stringify(
                    applicationsData.filter((app: Application) => app.status === 'approved'),
                    null,
                    2
                ));
                console.log('=======================');
                setApplications(applicationsData);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const formatAddress = (address: Property['address']) => {
        return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    // Log property information before rendering
    console.log('=== RENDERING INFO ===');
    console.log('Dashboard Property:', JSON.stringify(dashboardData?.property, null, 2));
    console.log('Dashboard Property ID:', dashboardData?.property?._id);
    console.log('Applications:', JSON.stringify(applications, null, 2));
    console.log('Approved Applications:', JSON.stringify(
        applications.filter((app: Application) => app.status === 'approved'),
        null,
        2
    ));
    console.log('=====================');

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Welcome, {dashboardData?.profile.name}</span>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Property Information */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Property Information</h2>
                        {dashboardData?.property ? (
                            <>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Property:</span> {dashboardData.property.name}</p>
                                    <p><span className="font-medium">Address:</span> {formatAddress(dashboardData.property.address)}</p>
                                    <p><span className="font-medium">Rent:</span> ${dashboardData.property.rent}/month</p>
                                    <p><span className="font-medium">Due Date:</span> {dashboardData.payments.upcomingPayment?.dueDate}</p>
                                </div>
                                <Link href={`/dashboard/tenant/properties/${dashboardData.property._id}`} className="text-blue-500 hover:underline mt-4 block">
                                    View Property Details →
                                </Link>
                            </>
                        ) : applications.some(app => app.status === 'approved') ? (
                            <>
                                <div className="text-gray-500">
                                    <p>Your property is being processed. Please check your applications.</p>
                                </div>
                                {applications.map(app => 
                                    app.status === 'approved' && app.property && app.property._id && (
                                        <Link 
                                            key={app._id} 
                                            href={`/dashboard/tenant/properties/${app.property._id}`} 
                                            className="text-blue-500 hover:underline mt-4 block"
                                        >
                                            View Property Details →
                                        </Link>
                                    )
                                )}
                            </>
                        ) : (
                            <div className="text-gray-500">
                                <p>No property assigned yet.</p>
                                <Link href="/properties" className="text-blue-500 hover:underline mt-4 block">
                                    Browse Available Properties →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Chat Notification */}
                    {userId && <ChatNotification userId={userId} role="Tenant" />}

                    {/* Payment Information */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                        {dashboardData?.property ? (
                            <>
                                <div className="space-y-4">
                                    {dashboardData.payments.lastPayment && (
                                        <div>
                                            <h3 className="font-medium">Last Payment</h3>
                                            <p>Amount: ${dashboardData.payments.lastPayment.amount}</p>
                                            <p>Date: {dashboardData.payments.lastPayment.date}</p>
                                            <p>Status: <span className="text-green-500">{dashboardData.payments.lastPayment.status}</span></p>
                                        </div>
                                    )}
                                    {dashboardData.payments.upcomingPayment && (
                                        <div>
                                            <h3 className="font-medium">Upcoming Payment</h3>
                                            <p>Amount: ${dashboardData.payments.upcomingPayment.amount}</p>
                                            <p>Due Date: {dashboardData.payments.upcomingPayment.dueDate}</p>
                                        </div>
                                    )}
                                </div>
                                <Link href="/payments" className="text-blue-500 hover:underline mt-4 block">
                                    View Payment History →
                                </Link>
                            </>
                        ) : (
                            <div className="text-gray-500">
                                <p>No payment information available.</p>
                                <p>Please select a property to view payment details.</p>
                            </div>
                        )}
                    </div>

                    {/* Maintenance Requests */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Maintenance Requests</h2>
                        {dashboardData?.property ? (
                            <>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Pending Requests:</span>
                                        <span className="font-medium">{dashboardData.maintenanceRequests.pending}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Completed Requests:</span>
                                        <span className="font-medium">{dashboardData.maintenanceRequests.completed}</span>
                                    </div>
                                </div>
                                <Link href="/maintenance" className="text-blue-500 hover:underline mt-4 block">
                                    View Maintenance Requests →
                                </Link>
                            </>
                        ) : (
                            <div className="text-gray-500">
                                <p>No maintenance requests available.</p>
                                <p>Please select a property to submit maintenance requests.</p>
                            </div>
                        )}
                    </div>

                    {/* Available Properties - Only show if no approved property */}
                    {!dashboardData?.property && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Available Properties</h2>
                            <div className="space-y-4">
                                {availableProperties.map(property => (
                                    <div key={property._id} className="border-b pb-4">
                                        <h3 className="font-medium">{property.name}</h3>
                                        <p className="text-gray-600">{formatAddress(property.address)}</p>
                                        <p className="text-gray-600">${property.rent}/month</p>
                                        <Link href={`/properties/${property._id}`} className="text-blue-500 hover:underline">
                                            View Details →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* My Applications */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">My Applications</h2>
                        <div className="space-y-4">
                            {applications.map(application => (
                                <div key={application._id} className="border-b pb-4">
                                    <h3 className="font-medium">{application.property.name}</h3>
                                    <p className="text-gray-600">{formatAddress(application.property.address)}</p>
                                    <p className="text-gray-600">Status: {application.status}</p>
                                    <p className="text-gray-600">Applied: {new Date(application.createdAt).toLocaleDateString()}</p>
                                    <Link href={`/applications/${application._id}`} className="text-blue-500 hover:underline">
                                        View Application →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-4">
                            {dashboardData?.property ? (
                                <>
                                    <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                                        Submit Maintenance Request
                                    </button>
                                    <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
                                        Make Payment
                                    </button>
                                    <button className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600">
                                        Contact Landlord
                                    </button>
                                </>
                            ) : (
                                <Link href="/properties" className="block w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center">
                                    Browse Available Properties
                                </Link>
                            )}
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

                    {/* Notifications */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                        <div className="space-y-4">
                            {dashboardData?.property ? (
                                <>
                                    <div className="p-3 bg-yellow-50 rounded">
                                        <p className="text-sm text-yellow-800">Upcoming rent payment due in 5 days</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded">
                                        <p className="text-sm text-green-800">Maintenance request #123 has been completed</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded">
                                        <p className="text-sm text-blue-800">New message from your landlord</p>
                                    </div>
                                </>
                            ) : (
                                <div className="p-3 bg-blue-50 rounded">
                                    <p className="text-sm text-blue-800">Welcome! Please select a property to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* New Section */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Your Applications</h2>
                    <div className="flex space-x-4">
                        <Link href="/dashboard/tenant/applications" className="text-blue-500 hover:underline">
                            View All →
                        </Link>
                        <Link href="/dashboard/tenant/leases" className="text-blue-500 hover:underline">
                            View Leases →
                        </Link>
                    </div>
                </div>

                {/* New Actions */}
                <div className="space-y-4">
                    <Link href="/dashboard/tenant/applications" className="block w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center">
                        View Applications
                    </Link>
                    <Link href="/dashboard/tenant/leases" className="block w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 text-center">
                        View Leases
                    </Link>
                    <Link href="/dashboard/tenant/maintenance" className="block w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 text-center">
                        Submit Maintenance Request
                    </Link>
                    <Link href="/dashboard/tenant/payments" className="block w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 text-center">
                        View Payments
                    </Link>
                    <Link href="/dashboard/tenant/messages" className="block w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 text-center">
                        Messages
                    </Link>
                </div>
            </div>
        </div>
    );
} 