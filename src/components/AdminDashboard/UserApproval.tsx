import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { adminService } from '@/services/admin';
import { type User } from '@/types';
import { LoadingSkeleton } from '../LoadingSkeleton';

interface UserApprovalProps {
  className?: string;
}

const UserApproval: React.FC<UserApprovalProps> = ({ className = '' }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getUserManagement();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUserAction = async (userId: number, action: 'approve' | 'reject') => {
    setActionLoading(userId);
    
    try {
      const response = await adminService.manageUser(userId, action);
      if (response.success) {
        // Reload users after successful action
        await loadUsers();
      } else {
        setError(response.message || 'Failed to perform action');
      }
    } catch (err) {
      setError('Failed to perform action');
      console.error('Error managing user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckIcon className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        </div>
        <div className="p-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingUsers = users.filter(user => !user.isApproved);
  const approvedUsers = users.filter(user => user.isApproved);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage user registrations and approvals
        </p>
      </div>

      <div className="p-6">
        {/* Pending Users Section */}
        {pendingUsers.length > 0 && (
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Pending Approval ({pendingUsers.length})
            </h4>
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-medium text-gray-900">{user.fullName}</h5>
                        {getStatusBadge(user)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Username:</span> {user.username}</p>
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">Registered:</span> {formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleUserAction(user.id, 'approve')}
                        disabled={actionLoading === user.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === user.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'reject')}
                        disabled={actionLoading === user.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === user.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Users Section */}
        {approvedUsers.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Approved Users ({approvedUsers.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.approvedAt ? formatDate(user.approvedAt) : '-'}
                        {user.approvedByUsername && (
                          <div className="text-xs text-gray-400">
                            by {user.approvedByUsername}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No users message */}
        {users.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600">No users have registered yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserApproval;
