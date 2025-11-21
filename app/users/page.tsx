'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UsersDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name'); // New state for search field

  // Redirect unauthenticated users or non-admin users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    // Redirect users without proper roles
    else if (status === 'authenticated' && session?.user?.role && 
             !['staff', 'admin', 'super-admin'].includes(session.user.role)) {
      router.push('/dashboard');
    }
  }, [status, router, session]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (status !== 'authenticated' || 
          (session?.user?.role && !['staff', 'admin', 'super-admin'].includes(session.user.role))) {
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/users?page=${currentPage}&limit=${usersPerPage}&search=${searchTerm}&field=${searchField}`);
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data.users);
          setTotalUsers(data.total);
        } else {
          setError(data.error || 'Failed to fetch users');
        }
      } catch (err) {
        setError('An error occurred while fetching users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [status, session, currentPage, usersPerPage, searchTerm, searchField]);

  // Handle delete user with confirmation
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the user list
        const response = await fetch(`/api/users?page=${currentPage}&limit=${usersPerPage}&search=${searchTerm}&field=${searchField}`);
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data.users);
          setTotalUsers(data.total);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('An error occurred while deleting the user');
      console.error(err);
    }
  };

  // Handle promote account type with confirmation
  const handlePromoteAccountType = async (userId: string, newAccountType: string, userName: string) => {
    if (!confirm(`Are you sure you want to change ${userName}'s account type to "${newAccountType}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}/account-type`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountType: newAccountType }),
      });
      
      if (response.ok) {
        // Refresh the user list
        const response = await fetch(`/api/users?page=${currentPage}&limit=${usersPerPage}&search=${searchTerm}&field=${searchField}`);
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data.users);
          setTotalUsers(data.total);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update account type');
      }
    } catch (err) {
      alert('An error occurred while updating the account type');
      console.error(err);
    }
  };

  // Handle promote role with confirmation
  const handlePromoteRole = async (userId: string, newRole: string, userName: string) => {
    if (!confirm(`Are you sure you want to change ${userName}'s role to "${newRole}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (response.ok) {
        // Refresh the user list
        const response = await fetch(`/api/users?page=${currentPage}&limit=${usersPerPage}&search=${searchTerm}&field=${searchField}`);
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data.users);
          setTotalUsers(data.total);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (err) {
      alert('An error occurred while updating the role');
      console.error(err);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleUsersPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Check if current user can promote account types
  const canPromoteAccountType = () => {
    return ['admin', 'super-admin'].includes(session?.user?.role || '');
  };

  // Check if current user can promote roles
  const canPromoteRole = () => {
    return ['admin', 'super-admin'].includes(session?.user?.role || '');
  };

  // Check if current user can delete users
  const canDeleteUser = () => {
    return ['admin', 'super-admin'].includes(session?.user?.role || '');
  };

  // Get available account types for promotion
  const getAccountTypes = () => {
    return ['free', 'freemium', 'pro', 'ultra-pro'];
  };

  // Get available roles for promotion (excluding super-admin for admins)
  const getRoles = () => {
    if (session?.user?.role === 'admin') {
      return ['user', 'staff', 'admin']; // Exclude super-admin for admins
    }
    return ['user', 'staff', 'admin', 'super-admin']; // Only super-admins can promote to super-admin
  };

  // Search field options
  const searchFields = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'role', label: 'Role' },
    { value: 'accountType', label: 'Account Type' }
  ];

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 shadow-xl shadow-black/50">
          Loading...
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || 
      (session?.user?.role && !['staff', 'admin', 'super-admin'].includes(session.user.role))) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#030712] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-indigo-300">Admin Portal</p>
              <h1 className="mt-1 text-3xl font-semibold text-white">User Management</h1>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link 
                href="/dashboard"
                className="rounded-2xl bg-linear-to-r from-indigo-500 via-purple-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.01]"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">User Management</h2>
            <div className="mt-4 flex flex-col sm:mt-0 sm:flex-row sm:items-center sm:space-x-4">
              <div className="flex items-center space-x-2">
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                >
                  {searchFields.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-300">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-300">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-300">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-300">Account Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-white">{user.name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">{user.email}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
                            {user.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                            {user.accountType}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <div className="flex flex-col space-y-2">
                            {/* Promote Account Type - Only for admin and super-admin, not for self */}
                            {canPromoteAccountType() && session?.user?.id !== user._id && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-400">Account:</span>
                                <div className="flex space-x-1">
                                  {getAccountTypes().map((type) => (
                                    <button
                                      key={type}
                                      onClick={() => handlePromoteAccountType(user._id, type, user.name)}
                                      className={`rounded px-2 py-1 text-xs font-medium ${
                                        user.accountType === type 
                                          ? 'bg-indigo-600 text-white' 
                                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                      }`}
                                    >
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Promote Role - Only for admin and super-admin, not for self */}
                            {canPromoteRole() && session?.user?.id !== user._id && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-400">Role:</span>
                                <div className="flex space-x-1">
                                  {getRoles().map((role) => (
                                    <button
                                      key={role}
                                      onClick={() => handlePromoteRole(user._id, role, user.name)}
                                      className={`rounded px-2 py-1 text-xs font-medium ${
                                        user.role === role 
                                          ? 'bg-green-600 text-white' 
                                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                      }`}
                                    >
                                      {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Delete User - Only for admin and super-admin, not for self */}
                            {canDeleteUser() && session?.user?.id !== user._id && (
                              <button
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                className="mt-1 rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700 self-start"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col items-center justify-between sm:flex-row">
                <div className="mb-4 flex items-center sm:mb-0">
                  <span className="text-sm text-slate-400">Rows per page:</span>
                  <select
                    value={usersPerPage}
                    onChange={handleUsersPerPageChange}
                    className="ml-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                  </select>
                  <span className="ml-4 text-sm text-slate-400">
                    Showing {Math.min(users.length, usersPerPage)} of {totalUsers} users
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-slate-700 text-slate-500'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'bg-slate-700 text-slate-500'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}