'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone_number: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const TENANT_ID = '85e22b61-913a-4053-81f2-005cfb5c7bf5';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    const { error } = await supabase
      .from('leads')
      .insert([{ 
        ...formData, 
        tenant_id: TENANT_ID 
      }]);

    if (error) {
      console.error(error);
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    } else {
      setStatus('success');
      setFormData({ name: '', email: '', phone_number: '' });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-6">Get Started</h1>

        {status === 'success' ? (
          <div className="text-center text-green-400 py-8">
            <p className="text-lg font-bold">Thank you!</p>
            <p>We will be in touch soon.</p>
            <button 
              onClick={() => setStatus('idle')} 
              className="mt-4 text-sm text-slate-400 underline"
            >
              Submit another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              className="w-full p-3 bg-slate-800 rounded border border-slate-700 text-white focus:border-blue-500 outline-none"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              required
              type="email"
              className="w-full p-3 bg-slate-800 rounded border border-slate-700 text-white focus:border-blue-500 outline-none"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              required
              type="tel"
              className="w-full p-3 bg-slate-800 rounded border border-slate-700 text-white focus:border-blue-500 outline-none"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
            
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            
            <button 
              disabled={status === 'submitting'}
              type="submit"
              className="w-full bg-blue-600 py-3 rounded font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}