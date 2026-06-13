'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface LeadProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  priority: string;
  scriptAngle: string;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<LeadProfile[]>([]);
  const [callingId, setCallingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ⚡ Fetch fresh, live lead metrics instantly from your database rows
  useEffect(() => {
    async function fetchLiveLeads() {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('score', { ascending: false }); // High-ticket leads go to the top

        if (error) {
          console.error('Error fetching system telemetry:', error);
        } else if (data) {
          const mappedLeads = data.map((item: any) => ({
            id: item.id || item.phone,
            name: item.name,
            email: item.email,
            phone: item.phone,
            score: item.score,
            priority: item.priority,
            scriptAngle: item.script_angle
          }));
          setLeads(mappedLeads);
        }
      } catch (err) {
        console.error('Data pull exception:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveLeads();

    // Live update loop refreshes console data views smoothly every 5 seconds
    const liveMonitorInterval = setInterval(fetchLiveLeads, 5000);
    return () => clearInterval(liveMonitorInterval);
  }, []);

  const triggerVapiVoiceAgent = async (lead: LeadProfile) => {
    setCallingId(lead.id);
    console.log(`Initializing Vapi Outbound Connection Lane to: ${lead.phone}`);
    
    try {
      const response = await fetch('/api/trigger-vapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: lead.phone, script: lead.scriptAngle })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`🚀 Vapi Outbound Agent successfully dispatched to dial ${lead.name}!`);
      } else {
        alert(`❌ Vapi Connection Blocked:\nStatus: ${response.status}\nReason: ${result.error || 'Unknown Pipeline Error'}`);
        console.error('Server rejection data packet:', result);
      }
    } catch (err: any) {
      console.error(err);
      alert(`💥 Network Crash: ${err.message}`);
    } finally {
      setCallingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8 font-sans">
      {/* Header Matrix */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            TELETRANSFORMERS AI
          </h1>
          <p className="text-xs text-zinc-400 mt-1">System Routing Console • Production Control Panel</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-400 tracking-wide">SYSTEM CORE ONLINE</span>
        </div>
      </div>

      {/* Main Monitoring Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 tracking-tight text-zinc-200">High-Priority Direct Outbound Matrix</h2>
        
        {loading ? (
          <div className="text-sm font-mono text-zinc-500 animate-pulse py-8 text-center border border-dashed border-zinc-800 rounded-xl">
            Synchronizing with cloud ledger database metrics...
          </div>
        ) : leads.length === 0 ? (
          <div className="text-sm font-mono text-zinc-500 py-8 text-center border border-dashed border-zinc-800 rounded-xl">
            No active lead profiles tracked inside database storage.
          </div>
        ) : (
          <div className="grid gap-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition duration-200">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  
                  {/* Profile Identity Data */}
                  <div className="space-y-1.5 flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-100 text-base">{lead.name}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Score: {lead.score}
                      </span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                        lead.priority === 'HIGH' 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                          : lead.priority === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {lead.priority}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">{lead.email} • {lead.phone}</p>
                    <p className="text-xs text-zinc-300 italic bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/60 mt-2 leading-relaxed">
                      <span className="text-emerald-400 font-semibold font-mono not-italic mr-1">Generated Hook:</span> "{lead.scriptAngle}"
                    </p>
                  </div>

                  {/* Dial Execution Mechanism */}
                  <div className="sm:self-center">
                    <button
                      onClick={() => triggerVapiVoiceAgent(lead)}
                      disabled={callingId !== null}
                      className={`px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition duration-150 whitespace-nowrap ${
                        callingId === lead.id
                          ? 'bg-amber-500 text-black animate-pulse'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95 disabled:opacity-40'
                      }`}
                    >
                      {callingId === lead.id ? 'Dialing Line...' : 'Trigger Vapi Call'}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}