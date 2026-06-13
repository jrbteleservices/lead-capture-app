'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Vapi from '@vapi-ai/web';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Safely initialize Vapi fallback
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || 'YOUR_PUBLIC_KEY_FALLBACK');

function AgencyMainContent() {
  const searchParams = useSearchParams();

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [connectingCall, setConnectingCall] = useState(false);

  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    vapi.on('call-start', () => {
      setIsSessionActive(true);
      setConnectingCall(false);
    });

    vapi.on('call-end', () => {
      setIsSessionActive(false);
      setConnectingCall(false);
    });

    vapi.on('error', (err: any) => {
      const message = err?.message || err || 'Unknown Vapi Framework Error';
      window.console.warn('Vapi Background Alert Logged safely:', message);
      setConnectingCall(false);
      setIsSessionActive(false);
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const toggleAgencyVoiceCall = async () => {
    if (isSessionActive) {
      vapi.stop();
    } else {
      setConnectingCall(true);
      try {
        const agencyAgentId = process.env.NEXT_PUBLIC_AGENCY_VAPI_ID || "fdd7bb02-b191-4574-8bc7-1ed27ca3985b";
        await vapi.start(agencyAgentId);
      } catch (err) {
        window.console.warn('Vapi Stream Execution Failed:', err);
        setConnectingCall(false);
      }
    }
  };

  const handleAgencyLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    
    try {
      // INSTANT WRITE: Send to 'pending_leads'
      const { error } = await supabase
        .from('pending_leads')
        .insert([{
          name: leadName.trim(),
          email: leadEmail.trim(),
          phone: leadPhone.trim(),
          status: 'PENDING'
        }]);

      if (error) throw error;
      setLeadSuccess(true); // User gets instant success
    } catch (err) {
      alert('Submission failed.');
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      {/* Navigation Brand Bar */}
      <nav className="border-b border-slate-900 bg-[#030712]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
          TELETRANSFORMERS <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">AI</span>
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAgencyVoiceCall}
            disabled={connectingCall}
            className={`text-xs font-mono font-bold px-4 py-2 rounded-lg border flex items-center gap-2 transition-all active:scale-95 ${
              isSessionActive 
                ? 'bg-rose-500/10 border-rose-500 text-rose-400 animate-pulse' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${isSessionActive ? 'bg-rose-500' : 'bg-emerald-400'}`} />
            {connectingCall ? 'CONNECTING...' : isSessionActive ? 'DISCONNECT AGENT' : 'SPEAK TO AI AGENT'}
          </button>
          <a href="#agency-contact" className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-transform active:scale-95">
            Partner With Us
          </a>
        </div>
      </nav>

      {/* Main Structural Hero Layout */}
      <header className="max-w-4xl mx-auto px-6 py-20 md:py-32 text-center space-y-6">
        <span className="inline-block text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Next-Gen Communication Hub
        </span>
        <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none text-white max-w-3xl mx-auto">
          High-Velocity B2B Lead Acquisition Systems
        </h1>
        <p className="text-md md:text-xl max-w-2xl mx-auto font-medium text-slate-400 leading-relaxed">
          Enterprise Appointment Setting, Cold-Calling Strategies, and Voice AI Automation architectures engineered to scale global client pipeline conversions.
        </p>
      </header>

      {/* Specialty Grid */}
      <section className="py-20 px-6 border-y border-slate-900 bg-slate-950/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-white mb-10">Our Core Specialty Workflows</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 shadow-xl space-y-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400">01</div>
              <h3 className="text-md font-bold text-white">B2B Appointment Setting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Performance-driven target execution pipelines designed to connect natively with business directors across premium international business markets.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 shadow-xl space-y-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400">02</div>
              <h3 className="text-md font-bold text-white">Autonomous Voice AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Custom conversational configurations connected dynamically to handle high-volume outbound calling systems and instant discovery qualification loops.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 shadow-xl space-y-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400">03</div>
              <h3 className="text-md font-bold text-white">Data Infrastructure</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Robust tracking systems wired with clean platform layers to guarantee targeted client metrics sync precisely into execution databases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Human Intelligence Statement */}
      <section className="max-w-4xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-black tracking-tight text-white leading-none">Human Intelligence Framework</h2>
        </div>
        <div className="md:col-span-2 text-sm leading-relaxed text-slate-400 font-medium">
          <p>
            We merge direct tele-services expertise with modern AI orchestration systems to build flexible distribution engines. Our frameworks operate seamlessly across complex global hours to ensure consistent, highly qualified prospect volumes.
          </p>
        </div>
      </section>

      {/* Lead Capture */}
      <section id="agency-contact" className="py-20 px-6 border-t border-slate-900 bg-slate-950/20">
        <div className="max-w-md mx-auto border border-slate-900 rounded-3xl p-8 shadow-2xl bg-slate-950/60 backdrop-blur-sm">
          <h2 className="text-xl font-black tracking-tight text-white mb-1">Scale Your Performance Routing</h2>
          <p className="text-xs text-slate-500 mb-6 font-medium">Connect parameters and qualified leads directly into your voice automation pipeline.</p>
          <form onSubmit={handleAgencyLeadSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Full Name</label>
              <input
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                placeholder="Optional / Prospect Name"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Email</label>
              <input
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                placeholder="Optional / prospect@example.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Phone</label>
              <input
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <button
              type="submit"
              disabled={submittingLead}
              className="w-full inline-flex justify-center items-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {submittingLead ? 'Submitting...' : 'Send Lead to Pipeline'}
            </button>
            {leadSuccess && (
              <p className="text-sm text-emerald-300">Lead submitted successfully. Our team will follow up shortly.</p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center">Loading...</div>}>
      <AgencyMainContent />
    </Suspense>
  );
}
