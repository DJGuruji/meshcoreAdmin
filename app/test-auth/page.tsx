'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function TestAuth() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Authentication Test</h1>
      {session ? (
        <div>
          <p>Signed in as {session.user?.email}</p>
          <p>Role: {session.user?.role}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      ) : (
        <div>
          <p>Not signed in</p>
          <button onClick={() => signIn()}>Sign in</button>
        </div>
      )}
    </div>
  );
}