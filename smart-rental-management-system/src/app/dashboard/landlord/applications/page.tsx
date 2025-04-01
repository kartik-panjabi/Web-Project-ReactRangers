'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Application {
  _id: string;
  property: {
    _id: string;
    name: string;
    rent: number;
  };
  tenant: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
  employmentStatus: string;
  annualIncome: number;
  currentAddress: string;
  previousLandlord: {
    name: string;
    email: string;
    phone: string;
  };
  reasonForMoving: string;
}

export default function LandlordApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/applications/landlord', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Refresh applications list
      fetchApplications();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Property Applications</h1>

      <div className="grid gap-6">
        {applications.map((application) => (
          <div key={application._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{application.property.name}</h2>
                <p className="text-gray-600">Monthly Rent: ${application.property.rent}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-medium mb-2">Applicant Information</h3>
                <p className="text-gray-600">Name: {application.tenant.name}</p>
                <p className="text-gray-600">Email: {application.tenant.email}</p>
                <p className="text-gray-600">Employment: {application.employmentStatus}</p>
                <p className="text-gray-600">Annual Income: ${application.annualIncome}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Previous Landlord</h3>
                <p className="text-gray-600">Name: {application.previousLandlord.name}</p>
                <p className="text-gray-600">Email: {application.previousLandlord.email}</p>
                <p className="text-gray-600">Phone: {application.previousLandlord.phone}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">Current Address</h3>
              <p className="text-gray-600">{application.currentAddress}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">Reason for Moving</h3>
              <p className="text-gray-600">{application.reasonForMoving}</p>
            </div>

            {application.status === 'pending' && (
              <div className="flex gap-4">
                <button
                  onClick={() => handleStatusUpdate(application._id, 'approved')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => handleStatusUpdate(application._id, 'rejected')}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Reject Application
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="text-center text-gray-600 py-8">
          No applications found.
        </div>
      )}
    </div>
  );
} 