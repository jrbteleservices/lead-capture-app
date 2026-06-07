'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type SpeechRecognitionWindow = typeof window & {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
};

export default function AdminDashboard() {
  // Original System State
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // New Autonomous Voice System State
  const [subdomain, setSubdomain] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [recognition, setRecognition] = useState<any>(null);

  // Hardcoded alpha tester tenant identifier from your tracking system
  const tenantId = '85e22b61-913a-4053-81f2-005cfb5c7bf5';

  const loadingSteps = [
    'Initializing voice capturing array...',
    'Analyzing brand tone & vocal syntax...',
    'Isolating core industry keywords...',
    'Executing Gemini context mapping parameters...',
    'Structuring business services data arrays...',
    'Drafting contextually unique copy & headlines...',
    'Assigning hexadecimal brand color palettes...',
    'Validating JSON structure inside core engine...',
    'Provisioning multi-tenant database records...',
    'Deploying ultra-fast mobile storefront layer...'
  ];

  // 1. Load Recent Leads (Preserving your original engine setup)
  async function loadLeads() {
    setLoadingLeads(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading leads:", error);
      toast.error("Failed to load incoming leads.");
    } else {
      setLeads(data || []);
    }
    setLoadingLeads(false);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  // 2. Initialize Native Speech Engine on Mount
  useEffect(() => {
    const typeofWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = typeofWindow.SpeechRecognition || typeofWindow.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const currentResultIndex = event.resultIndex;
        const textResult = event.results[currentResultIndex][0].transcript;
        setTranscript((prev) => (prev ? `${prev} ${textResult}` : textResult));
      };

      rec.onerror = (err: any) => {
        console.error('Speech capture error:', err.error);
        if (err.error !== 'no-speech') {
          toast.error('Audio hardware capture failed.');
          setIsRecording(false);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  // 3. Drive Ghost Typography Progression Timers
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isProcessing) {
      intervalId = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingSteps.length - 1) return prev + 1;
          return prev;
        });
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(intervalId);
  }, [isProcessing]);

  // 4. Handle Original Content Text Updates
  const handleUpdate = async () => {
    try {
      const { data: record, error: fetchError } = await supabase
        .from('websites')
        .select('site_data')
        .eq('subdomain', 'test-bpo')
        .single();

      if (fetchError || !record) throw new Error("Could not fetch target site data.");

      const updatedData = {
        ...record.site_data,
        heroSection: {
          ...record.site_data.heroSection,
          headline: headline || record.site_data.heroSection?.headline || '',
          subheadline: subheadline || record.site_data.heroSection?.subheadline || ''
        }
      };

      const { error: updateError } = await supabase
        .from('websites')
        .update({ site_data: updatedData })
        .eq('subdomain', 'test-bpo');

      if (updateError) throw updateError;
      toast.success('Text changes synchronized successfully!');
      setHeadline('');
      setSubheadline('');
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    }
  };

  // 5. Microphone Toggle Controller
  const toggleRecording = () => {
    if (!recognition) {
      toast.error('Voice capturing is not supported natively by this web browser browser framework.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      toast.success('Audio transcript captured cleanly.');
    } else {
      setTranscript('');
      try {
        recognition.start();
        setIsRecording(true);
        toast.info('System micro-arrays active. Speak clearly now...');
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 6. Submit Payload to Your Self-Healing Gemini Route
  const handleGenerateSite = async () => {
    if (!subdomain.trim()) {
      toast.error('Please input a target subdomain route string.');
      return;
    }
    if (!transcript.trim()) {
      toast.error('Please capture a microphone voice layout transcript first.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch('/api/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          subdomain,
          ownerEmail: user?.email || null
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'The system failed processing the autonomous build.');
      }

      toast.success('Autonomous VoiceSite provisioned successfully!');
      setSubdomain('');
      setTranscript('');
    } catch (error: any) {
      toast.error(error.message || 'Pipeline process exception.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-10 text-white min-h-screen bg-slate-950 font-sans selection:bg-emerald-500/30">
      <header className="mb-10 max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            VoiceSites Management Panel
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Running alpha optimization tier 1 deployment frameworks.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-xs text-slate-400 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Engine Operational
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-10">
        
        {/* --- SECTION 1: AUTONOMOUS VOICE ENGINE RUNWAY --- */}
        <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-900 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-4 tracking-tight text-slate-100 flex items-center gap-2">
            <span className="text-emerald-500 font-mono text-sm">01/</span> Autonomous AI Factory Engine
          </h2>
          
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center min-h-[250px] border border-slate-800/60 bg-slate-950/40 rounded-xl p-8 text-center">
              <div className="relative mb-6 flex h-12 w-12 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/10 opacity-75"></span>
                <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
              </div>
              <p className="text-md font-mono text-slate-200 min-h-[24px] animate-pulse">
                {loadingSteps[loadingStep]}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-3 tracking-widest uppercase">
                Checkpoint {loadingStep + 1} of {loadingSteps.length}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Target Subdomain Link</label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 focus-within:border-slate-700 transition-colors px-4">
                  <input
                    type="text"
                    placeholder="desired-business-link"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    className="flex-1 bg-transparent py-3 text-sm text-slate-100 outline-none placeholder:text-slate-700 font-mono"
                  />
                  <span className="text-xs font-mono text-slate-500 select-none">.voicesites.app</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">Voice Capture Trigger</label>
                <div className="relative flex flex-col items-center justify-center border border-dashed border-slate-800 bg-slate-950/20 rounded-xl p-6 text-center min-h-[160px]">
                  {isRecording ? (
                    <div className="space-y-3 flex flex-col items-center">
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className="h-12 w-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
                      >
                        <div className="h-4 w-4 bg-white rounded-sm animate-pulse" />
                      </button>
                      <p className="text-[11px] font-mono font-bold tracking-widest text-rose-400 uppercase animate-pulse">System Logging Micro-Arrays...</p>
                    </div>
                  ) : (
                    <div className="space-y-3 flex flex-col items-center">
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className="h-12 w-12 rounded-full bg-slate-950 border border-slate-800 text-slate-400 flex items-center justify-center shadow-md hover:bg-slate-900 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                      <p className="text-xs text-slate-400 max-w-xs px-4">Toggle microphone to state corporate name, services, and location parameters.</p>
                    </div>
                  )}

                  {transcript && (
                    <div className="w-full mt-4 text-left border-t border-slate-900 pt-3">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Live Audio String Readout:</p>
                      <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded border border-slate-900 leading-relaxed">
                        "{transcript}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerateSite}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold tracking-wide text-xs uppercase text-white shadow-lg shadow-emerald-950/20 hover:from-emerald-500 hover:to-teal-500 transition-all duration-300"
              >
                Initiate Autonomous AI Build Loop
              </button>
            </div>
          )}
        </section>

        {/* --- SECTION 2: ORIGINAL MANUAL RE-WRITING UTILITY --- */}
        <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-900 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-4 tracking-tight text-slate-100 flex items-center gap-2">
            <span className="text-blue-500 font-mono text-sm">02/</span> Fine-Tune Storefront Layer (`test-bpo`)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-mono uppercase tracking-widest text-slate-400">Headline Text</label>
              <input
                className="bg-slate-950 text-slate-100 p-3 w-full rounded-xl border border-slate-800 focus:border-slate-700 outline-none text-sm font-medium"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Overwrite current storefront hero headline title" 
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-mono uppercase tracking-widest text-slate-400">Subheadline Text</label>
              <input
                className="bg-slate-950 text-slate-100 p-3 w-full rounded-xl border border-slate-800 focus:border-slate-700 outline-none text-sm font-medium"
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                placeholder="Overwrite current storefront description strings" 
              />
            </div>

            <button
              className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 w-full text-xs uppercase tracking-wider text-white shadow-md transition-all duration-300"
              onClick={handleUpdate}
            >
              Push Overwrite Modifications
            </button>
          </div>
        </section>

        {/* --- SECTION 3: RECENT OUTBOUND/INBOUND BPO LEADS --- */}
        <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-900 backdrop-blur-sm">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <span className="text-purple-500 font-mono text-sm">03/</span> Inbound Lead Vectors
            </h2>
            <button 
              onClick={loadLeads}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white transition-colors"
              title="Refresh Data Logs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
              </svg>
            </button>
          </header>
          
          <div className="overflow-x-auto border border-slate-900 rounded-xl bg-slate-950/40">
            <table className="w-full text-left border-collapse text-xs font-medium">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-mono uppercase tracking-wider bg-slate-950/80">
                  <th className="p-3.5">Prospect Name</th>
                  <th className="p-3.5">Email Vector</th>
                  <th className="p-3.5">Phone System</th>
                  <th className="p-3.5">Ingest Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {loadingLeads ? (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-500 font-mono">Querying multi-tenant rows...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-600 font-mono">No incoming leads captured yet.</td></tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-200">{lead.name}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{lead.email}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{lead.phone_number || 'N/A'}</td>
                      <td className="p-3.5 text-slate-500 font-mono">{new Date(lead.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}