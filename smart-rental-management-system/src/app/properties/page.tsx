'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  };
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties/public');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const formatAddress = (address: Property['address']) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  const handlePropertyClick = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Found {properties.length} properties</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
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
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{property.name}</h2>
                <p className="text-gray-600 mb-4">{formatAddress(property.address)}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600">Rent</p>
                    <p className="font-semibold">${property.rent}/month</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bedrooms</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bathrooms</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-semibold">{property.propertyType}</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePropertyClick(property._id)}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 