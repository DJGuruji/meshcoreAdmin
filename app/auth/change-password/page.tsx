'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';

function ChangePasswordContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect unauthenticated users to sign in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      // Call the change password API
      const response = await axios.post('/api/auth/change-password', { 
        currentPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${session?.user?.id}` // Using user ID as token for simplicity
        }
      });
      
      setMessage(response.data.message);
      
      // Clear form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles =
    'mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60';
  const labelStyles = 'text-xs font-semibold uppercase tracking-[0.2em] text-slate-300';

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 shadow-xl shadow-black/50">
          Checking authentication status…
        </div>
      </div>
    );
  }

  // Don't render the change password form if user is not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-indigo-300">Admin Portal</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Change Password</h1>
          <p className="mt-2 text-sm text-slate-400">
            Update your account password
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          {message && (
            <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className={labelStyles}>
                Current Password
              </label>
              <div className="relative mt-2">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputStyles}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className={labelStyles}>
                New Password
              </label>
              <div className="relative mt-2">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputStyles}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelStyles}>
                Confirm New Password
              </label>
              <div className="relative mt-2">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputStyles}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>{loading ? 'Updating Password…' : 'Change Password'}</span>
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-center text-sm text-slate-300">
            <Link href="/dashboard" className="font-semibold text-white hover:text-indigo-300">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 shadow-xl shadow-black/50">
          Loading...
        </div>
      </div>
    }>
      <ChangePasswordContent />
    </Suspense>
  );
}