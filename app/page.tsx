'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/signin');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712]">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 shadow-xl shadow-black/50">
        Redirecting to sign in…
      </div>
    </div>
  );
}