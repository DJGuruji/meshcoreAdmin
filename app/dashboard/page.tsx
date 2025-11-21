'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users to sign in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    // Redirect users without proper roles
    else if (status === 'authenticated' && session?.user?.role && 
             !['staff', 'admin', 'super-admin'].includes(session.user.role)) {
      router.push('/auth/signin?error=AccessDenied');
    }
  }, [status, router, session]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 shadow-xl shadow-black/50">
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || 
      (session?.user?.role && !['staff', 'admin', 'super-admin'].includes(session.user.role))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="border-b border-white/10 bg-slate-900/70 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-300">
                Welcome, {session?.user?.name} ({session?.user?.role})
              </span>
              <Link 
                href="/auth/change-password"
                className="rounded-lg bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Change Password
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-rose-600 px-3 py-1 text-sm font-medium text-white hover:bg-rose-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="mt-2 text-slate-400">
            Welcome to the admin dashboard. You have {session?.user?.role} privileges.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Show Users Management only to admin and super-admin */}
            {(session?.user?.role === 'admin' || session?.user?.role === 'super-admin') && (
              <Link href="/users" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
                <h3 className="text-lg font-semibold">User Management</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Manage users, roles, and permissions
                </p>
              </Link>
            )}
            
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">System Settings</h3>
              <p className="mt-2 text-sm text-slate-400">
                Configure system-wide settings
              </p>
            </div>
            
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Reports</h3>
              <p className="mt-2 text-sm text-slate-400">
                View system analytics and reports
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}