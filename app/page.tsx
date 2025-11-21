'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 shadow-xl shadow-black/50">
          Loading...
        </div>
      </div>
    );
  }

  // If authenticated, return null (will redirect)
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712] px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-[140px]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-200">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-orange-400" />
          Admin Portal
        </div>
        <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl md:text-6xl">
          Manage your platform with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-orange-300 bg-clip-text text-transparent">Sadasya Admin</span>
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 sm:text-xl">
          Control users, configure system settings, and view analytics from a centralized, secure dashboard.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: '👥', title: 'User Management', desc: 'View, edit, and manage user roles and permissions.' },
            { icon: '⚙️', title: 'System Settings', desc: 'Configure global application settings and preferences.' },
            { icon: '📊', title: 'Analytics', desc: 'Track user growth, engagement, and system performance.' },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-[0_20px_50px_rgba(15,23,42,0.5)] backdrop-blur-xl"
            >
              <div className="text-3xl">{card.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/auth/signin"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-400 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.01]"
          >
            Enter Admin Console
            <svg className="h-4 w-4 transition group-hover:translate-x-1" viewBox="0 0 20 20" fill="none">
              <path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 text-left text-sm text-slate-400 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">Secure Access</div>
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">Role-Based Control</div>
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">Real-time Updates</div>
        </div>
      </div>
    </div>
  );
}