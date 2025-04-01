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
  status: string;
  createdAt: string;
  employmentStatus: string;
  annualIncome: number;
}

export default function TenantApplications() {
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

      const response = await fetch('/api/applications', {
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

  const handleWithdraw = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw application');
      }

      // Refresh applications list
      fetchApplications();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Applications</h1>

      {applications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't submitted any applications yet.</p>
          <button
            onClick={() => router.push('/properties')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <div
              key={application._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {application.property.name}
                  </h2>
                  <p className="text-gray-600">
                    Monthly Rent: ${application.property.rent}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    application.status
                  )}`}
                >
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Employment Status</p>
                  <p className="font-medium">
                    {application.employmentStatus.charAt(0).toUpperCase() +
                      application.employmentStatus.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Annual Income</p>
                  <p className="font-medium">${application.annualIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applied On</p>
                  <p className="font-medium">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => router.push(`/properties/${application.property._id}`)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View Property
                </button>
                {application.status === 'pending' && (
                  <button
                    onClick={() => handleWithdraw(application._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Withdraw Application
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 