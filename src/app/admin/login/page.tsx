'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      router.push('/admin'); // Redirect to dashboard after login
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <form onSubmit={handleLogin} className="p-8 bg-slate-900 rounded border border-slate-800 w-96">
        <h1 className="text-xl font-bold mb-4">Admin Access</h1>
        <input className="w-full p-3 mb-4 bg-slate-800 rounded border border-slate-700" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full p-3 mb-4 bg-slate-800 rounded border border-slate-700" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-500">Sign In</button>
      </form>
    </div>
  );
}