'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<{
    totalUsers: number;
    admins: number;
    staffs: number;
    superAdmins: number;
    blocked: number;
  } | null>(null);

  const [showCookieConsent, setShowCookieConsent] = useState(false);

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

  // Check for cookie consent
  useEffect(() => {
    if (status === 'authenticated') {
      const consent = localStorage.getItem('cookieConsent');
      if (!consent) {
        setShowCookieConsent(true);
      }
    }
  }, [status]);

  useEffect(() => {
    const fetchStats = async () => {
      if (session?.user?.role === 'admin' || session?.user?.role === 'super-admin') {
        try {
          const res = await fetch('/api/dashboard/stats');
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        } catch (error) {
          console.error('Failed to fetch stats', error);
        }
      }
    };

    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, session]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookieConsent(false);
  };

  const handleRejectCookies = () => {
    router.push('/auth/signin');
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

  // Show cookie consent popup
  if (status === 'authenticated' && showCookieConsent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#050915]/95 p-8 text-white shadow-2xl shadow-black/80 backdrop-blur-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 mb-6">
              <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold">We Use Cookies</h2>
            
            <div className="mt-6 text-slate-300">
              <p className="mb-4">
                This website uses cookies to enhance your browsing experience and provide personalized content. 
                By clicking "Accept Cookies", you consent to our use of cookies in accordance with our{' '}
                <Link href="/privacy" className="text-indigo-300 hover:text-white underline">
                  Privacy Policy
                </Link>.
              </p>
              
              <p className="text-sm">
                Cookies help us understand how you interact with our website and improve your experience. 
                You must accept cookies to use this site.
              </p>
            </div>
            
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={handleAcceptCookies}
                className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-400 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.01]"
              >
                Accept Cookies
              </button>
              
              <button
                onClick={handleRejectCookies}
                className="rounded-2xl border border-white/10 px-8 py-3 text-base font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:text-white"
              >
                Reject (Sign Out)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || 
      (session?.user?.role && !['staff', 'admin', 'super-admin'].includes(session.user.role))) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-[140px]" />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-purple-500/15 blur-[160px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40" />
      </div>

      <div className="relative m-4 flex h-[calc(100vh-2rem)] overflow-hidden rounded-[32px] border border-white/5 bg-white/5 p-0 shadow-[0_25px_80px_rgba(2,6,23,0.9)] backdrop-blur-2xl">
        <div className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-200">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-orange-400" />
                Admin Portal
              </div>
              <h1 className="mt-6 text-4xl font-semibold text-white">Dashboard Overview</h1>
              <p className="mt-2 text-lg text-slate-400">
                Welcome back, <span className="text-white">{session?.user?.name}</span>. You have <span className="capitalize text-indigo-300">{session?.user?.role}</span> privileges.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Show Users Management only to admin and super-admin */}
              {(session?.user?.role === 'admin' || session?.user?.role === 'super-admin') && (
                <Link href="/users" className="group relative block overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-500/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-orange-400/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                      👥
                    </div>
                    <h3 className="text-xl font-semibold text-white">User Management</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Manage users, roles, and permissions across the platform.
                    </p>
                    {stats && (
                      <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-300">
                        <div className="rounded-xl bg-black/20 p-3">
                          <span className="block text-lg font-bold text-white">{stats.totalUsers}</span> Total
                        </div>
                        <div className="rounded-xl bg-black/20 p-3">
                          <span className="block text-lg font-bold text-indigo-400">{stats.admins}</span> Admins
                        </div>
                        <div className="rounded-xl bg-black/20 p-3">
                          <span className="block text-lg font-bold text-purple-400">{stats.superAdmins}</span> Super
                        </div>
                        <div className="rounded-xl bg-black/20 p-3">
                          <span className="block text-lg font-bold text-emerald-400">{stats.staffs}</span> Staff
                        </div>
                        <div className="col-span-2 rounded-xl bg-rose-500/10 p-3 text-center">
                          <span className="font-bold text-rose-400">{stats.blocked}</span> Blocked Users
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              )}
              
              <div className="group relative block overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-orange-400/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-2xl">
                    ⚙️
                  </div>
                  <h3 className="text-xl font-semibold text-white">System Settings</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Configure system-wide settings, API keys, and security policies.
                  </p>
                </div>
              </div>
              
              <div className="group relative block overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-orange-400/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl">
                    📊
                  </div>
                  <h3 className="text-xl font-semibold text-white">Reports</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    View detailed system analytics, audit logs, and performance reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}