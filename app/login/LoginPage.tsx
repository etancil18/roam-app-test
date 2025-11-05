'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const handleRedirect = async () => {
      const code = searchParams.get('code');
      const authError = searchParams.get('error_description');

      if (authError) {
        setError(authError);
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace('/map');
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(error.message);
          setLoading(false);
        } else {
          router.refresh(); // 🛠️ Force middleware to detect session
          router.replace('/map');
        }
      } else {
        setLoading(false);
      }
    };

    handleRedirect();
  }, [router, searchParams, supabase]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitted(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }
  }

  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {submitted ? (
        <p className="text-green-600">
          ✅ Check your email for the magic link to log in.
        </p>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send Magic Link
          </button>
        </form>
      )}

      {error && <p className="text-red-600 mt-4">⚠️ {error}</p>}
    </main>
  );
}
