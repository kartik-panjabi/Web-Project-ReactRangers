'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface Property {
  _id: string;
  name: string;
  rent: number;
  landlord: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface ApplicationFormData {
  employmentStatus: 'full-time' | 'part-time' | 'self-employed' | 'unemployed';
  annualIncome: number;
  currentAddress: string;
  previousLandlord: {
    name: string;
    email: string;
    phone: string;
  };
  reasonForMoving: string;
  additionalNotes: string;
}

export default function PropertyApplication() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({
    employmentStatus: 'full-time',
    annualIncome: 0,
    currentAddress: '',
    previousLandlord: {
      name: '',
      email: '',
      phone: ''
    },
    reasonForMoving: '',
    additionalNotes: ''
  });

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

        const response = await fetch(`/api/properties/${propertyId}/public`, {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('previousLandlord.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        previousLandlord: {
          ...prev.previousLandlord,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'annualIncome' ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const propertyId = params?.id;
      if (!propertyId || typeof propertyId !== 'string') {
        throw new Error('Invalid property ID');
      }

      const response = await fetch(`/api/properties/${propertyId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      alert('Application submitted successfully!');
      router.push('/dashboard/tenant');
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!property) return <div className="p-4">Property not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Apply for {property.name}</h1>
          <p className="text-gray-600 mb-6">Monthly Rent: ${property.rent}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status
              </label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="self-employed">Self Employed</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Income
              </label>
              <input
                type="number"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Address
              </label>
              <textarea
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                rows={3}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Previous Landlord Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="previousLandlord.name"
                    value={formData.previousLandlord.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="previousLandlord.email"
                    value={formData.previousLandlord.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="previousLandlord.phone"
                    value={formData.previousLandlord.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Moving
              </label>
              <textarea
                name="reasonForMoving"
                value={formData.reasonForMoving}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 