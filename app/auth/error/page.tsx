'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to access this page. Only staff, admin, and super-admin roles are allowed.';
      case 'Verification':
        return 'The verification token has expired or is invalid.';
      default:
        return 'An unknown error occurred during authentication.';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.12),_transparent_55%)]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <svg
                className="h-10 w-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">Authentication Error</h1>
            <p className="mt-2 text-sm text-slate-400">
              {getErrorMessage()}
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/auth/signin"
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 shadow-xl shadow-black/50">
          Loading...
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}