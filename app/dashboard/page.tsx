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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_55%)]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-indigo-300">Admin Portal</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Dashboard Overview</h1>
          <p className="mt-2 text-sm text-slate-400">
            Welcome to the admin dashboard. You have {session?.user?.role} privileges.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Show Users Management only to admin and super-admin */}
            {(session?.user?.role === 'admin' || session?.user?.role === 'super-admin') && (
              <Link href="/users" className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-indigo-400/40 hover:bg-white/10">
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-indigo-500/5 via-purple-500/5 to-orange-400/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <h3 className="text-lg font-semibold text-white">User Management</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Manage users, roles, and permissions
                  </p>
                </div>
              </Link>
            )}
            
            <div className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-indigo-400/40 hover:bg-white/10">
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-indigo-500/5 via-purple-500/5 to-orange-400/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <h3 className="text-lg font-semibold text-white">System Settings</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Configure system-wide settings
                </p>
              </div>
            </div>
            
            <div className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-indigo-400/40 hover:bg-white/10">
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-indigo-500/5 via-purple-500/5 to-orange-400/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <h3 className="text-lg font-semibold text-white">Reports</h3>
                <p className="mt-2 text-sm text-slate-400">
                  View system analytics and reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}