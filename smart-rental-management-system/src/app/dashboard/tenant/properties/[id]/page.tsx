'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

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
    propertyType: string;
    rent: number;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    description: string;
    amenities: string[];
    images: string[];
    status: string;
    landlord: {
        name: string;
        email: string;
        phone: string;
    };
}

export default function TenantPropertyDetails() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/auth/login');
                    return;
                }

                const propertyId = params?.id;
                if (!propertyId || typeof propertyId !== 'string') {
                    throw new Error('Invalid property ID');
                }

                const response = await fetch(`/api/properties/${propertyId}/tenant`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch property details');
                }
                
                const data = await response.json();
                setProperty(data);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch property details');
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetails();
    }, [params?.id, router]);

    const formatAddress = (address: Property['address']) => {
        return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    if (!property) return <div className="p-4">Property not found</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
                        <button
                            onClick={() => router.back()}
                            className="text-blue-500 hover:underline"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    {/* Image Gallery */}
                    <div className="mb-6">
                        <div className="relative h-64 rounded-lg overflow-hidden">
                            {property.images && property.images.length > 0 ? (
                                <Image
                                    src={property.images[0]}
                                    alt={property.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">No image available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Property Information</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">Address:</span> {formatAddress(property.address)}</p>
                                <p><span className="font-medium">Property Type:</span> {property.propertyType}</p>
                                <p><span className="font-medium">Bedrooms:</span> {property.bedrooms}</p>
                                <p><span className="font-medium">Bathrooms:</span> {property.bathrooms}</p>
                                <p><span className="font-medium">Square Footage:</span> {property.squareFootage}</p>
                                <p><span className="font-medium">Rent:</span> ${property.rent}/month</p>
                                <p><span className="font-medium">Status:</span> {property.status}</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">Landlord Information</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">Name:</span> {property.landlord.name}</p>
                                <p><span className="font-medium">Email:</span> {property.landlord.email}</p>
                                <p><span className="font-medium">Phone:</span> {property.landlord.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Description</h2>
                        <p className="text-gray-600">{property.description}</p>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {property.amenities.map((amenity, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded">
                                    {amenity}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 