'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Vapi from '@vapi-ai/web';

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
    
    // 1. Guard check immediately before hitting any backend pipelines
    if (!leadName || !leadEmail) return;

    setSubmittingLead(true);
    
    try {
      // 2. Commit lead record data into Supabase
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            tenant_id: '85e22b61-913a-4053-81f2-005cfb5c7bf5', 
            name: leadName,
            email: leadEmail,
            phone_number: leadPhone || null
          }
        ]);

      if (error) throw error;

      // 3. Hand off parameters to the Gemini Low-Latency Matrix Analyzer
      try {
        const analysisRes = await fetch('/api/analyze-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadName: leadName,
            leadEmail: leadEmail,
            leadPhone: leadPhone,
            industryContext: 'Teletransformers AI Inbound Portal'
          })
        });
        
        const analysisData = await analysisRes.json();
        window.console.log('Gemini Routing Matrix Signal:', analysisData.analysis);
      } catch (aiErr) {
        window.console.warn('Background AI analysis deferred safely:', aiErr);
      }

      // 4. Success UI Updates
      setLeadSuccess(true);
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
    } catch (err) {
      window.console.warn('Agency processing exception caught safely:', err);
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
          <p className="text-xs text-slate-500 mb-6 font-medium">Connect parameters directly to deploy targeted call routing across our network lanes.</p>
          
          {leadSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center text-xs font-mono font-bold text-emerald-400">
              Pipeline Parameters Logged. Initializing Diagnostic Validation Loops!
            </div>
          ) : (
            <form onSubmit={handleAgencyLeadSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Representative Name" 
                required 
                value={leadName} 
                onChange={(e) => setLeadName(e.target.value)} 
                className="w-full p-3 bg-slate-900 border border-slate-800 focus:border-slate-700 outline-none rounded-xl text-xs font-medium text-white placeholder-slate-500" 
              />
              <input 
                type="email" 
                placeholder="Corporate Email Address" 
                required 
                value={leadEmail} 
                onChange={(e) => setLeadEmail(e.target.value)} 
                className="w-full p-3 bg-slate-900 border border-slate-800 focus:border-slate-700 outline-none rounded-xl text-xs font-medium text-white placeholder-slate-500" 
              />
              <input 
                type="tel" 
                placeholder="System Direct Phone Number" 
                value={leadPhone} 
                onChange={(e) => setLeadPhone(e.target.value)} 
                className="w-full p-3 bg-slate-900 border border-slate-800 focus:border-slate-700 outline-none rounded-xl text-xs font-medium text-white placeholder-slate-500" 
              />
              <button 
                type="submit" 
                disabled={submittingLead} 
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] transition-all rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md disabled:bg-slate-800 disabled:text-slate-500"
              >
                {submittingLead ? 'Ingesting Pipeline Vectors...' : 'Establish Network Line'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-10 text-center text-[10px] font-mono tracking-widest text-slate-600 uppercase border-t border-slate-900">
        System Routing Console • Teletransformers AI Infrastructure Ltd
      </footer>
    </div>
  );
}

export default function MainAgencyHomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-600 font-mono text-xs uppercase tracking-widest">Warming Network Nodes...</div>}>
      <AgencyMainContent />
    </Suspense>
  );
}