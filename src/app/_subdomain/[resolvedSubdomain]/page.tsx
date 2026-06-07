'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Vapi from '@vapi-ai/web';

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || 'YOUR_PUBLIC_KEY_FALLBACK');

export default function AutonomousStorefrontInstance() {
  const params = useParams();
  const [resolvedSubdomain, setResolvedSubdomain] = useState<string>('');

  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [connectingCall, setConnectingCall] = useState(false);

  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

// Sync parameter extraction safely on mount execution
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathParam = params?.resolvedSubdomain as string;
      const urlParams = new URLSearchParams(window.location.search);
      const queryParam = urlParams.get('resolvedSubdomain');
      
      // If a parameter exists, use it; otherwise leave it empty to trigger the root view
      const activeSubdomain = pathParam || queryParam || '';
      setResolvedSubdomain(activeSubdomain);
      
      // If we are explicitly at the root domain without parameters, stop the loading screen
      if (!activeSubdomain) {
        setLoading(false);
      }
    }
  }, [params]);

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!resolvedSubdomain) return;

      setLoading(true);
      setErrorState(null);

      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('subdomain', resolvedSubdomain)
          .single();

        if (error) throw error;
        setSiteData(data);
      } catch (fetchError: any) {
        console.error('Tenant data fetch error:', fetchError);
        setErrorState(fetchError?.message || 'Unable to load tenant data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [resolvedSubdomain]);

  useEffect(() => {
    vapi.on('call-start', () => {
      setIsSessionActive(true);
      setConnectingCall(false);
    });

    vapi.on('call-end', () => {
      setIsSessionActive(false);
      setConnectingCall(false);
    });

    vapi.on('error', (error) => {
      console.error('Vapi Web SDK Error:', error);
      setConnectingCall(false);
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const toggleVoiceCallAgent = async () => {
    if (isSessionActive) {
      vapi.stop();
    } else {
      setConnectingCall(true);
      try {
        const targetAgentId = siteData?.site_data?.vapiAgentId || 'YOUR_VAPI_AGENT_ID';
        await vapi.start(targetAgentId);
      } catch (err) {
        console.error('Failed to initialize Vapi call:', err);
        setConnectingCall(false);
      }
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    setSubmittingLead(true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            tenant_id: siteData?.id || '85e22b61-913a-4053-81f2-005cfb5c7bf5',
            name: leadName,
            email: leadEmail,
            phone_number: leadPhone || null
          }
        ]);

      if (error) throw error;
      setLeadSuccess(true);
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
    } catch (err) {
      console.error('Lead submission error:', err);
    } finally {
      setSubmittingLead(false);
    }
  };
// If no tenant parameters are found in the query or path, route straight to your main agency portal
  if (!resolvedSubdomain && !loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white p-8 flex flex-col items-center justify-center font-sans antialiased">
        <div className="max-w-xl text-center space-y-6 border border-slate-900 bg-slate-950 p-10 rounded-3xl shadow-2xl">
          <span className="inline-block text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Main Agency Router Root
          </span>
          <h1 className="text-4xl font-black tracking-tight text-emerald-400">
            APEX CONTACT SOLUTIONS
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            Enterprise B2B Appointment Setting, AI Voice Agent Automation, and Lead Generation Systems engineered around speed and high-level human intelligence workflows.
          </p>
          <div className="pt-2">
            <span className="px-3 py-1.5 bg-slate-900 text-[10px] font-mono tracking-wider text-slate-500 rounded-lg border border-slate-800">
              STATUS: LISTENING FOR TENANT SECTORS
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Your existing loading block follows cleanly beneath it:
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs tracking-wider">
        <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        PARSING ISOLATED TENANT VECTORS...
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-xs tracking-wider">
        <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        PARSING ISOLATED TENANT VECTORS...
      </div>
    );
  }

  if (errorState || !siteData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-slate-300">
        <div className="border border-slate-900 bg-slate-900/20 max-w-sm rounded-2xl p-6">
          <h1 className="text-xs font-mono tracking-widest text-slate-500 uppercase mb-2">Platform Status</h1>
          <p className="text-sm font-medium text-slate-400">{errorState || 'Storefront Offline'}</p>
        </div>
      </div>
    );
  }

  // Safely extract values dynamically according to your SYSTEM_PROMPT schema rules
  const layout = siteData.site_data || {};
  const primaryColor = layout.branding?.primaryColor || '#10b981';
  const themeIsDark = layout.branding?.themeMode !== 'light';

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${themeIsDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Brand Header Navigation */}
      <nav className={`border-b px-6 py-4 flex items-center justify-between ${themeIsDark ? 'border-slate-900 bg-slate-950/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md sticky top-0 z-50`}>
        <span className="text-lg font-black tracking-tight uppercase" style={{ color: primaryColor }}>
          {layout.businessName || 'VoiceSite Storefront'}
        </span>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleVoiceCallAgent}
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

          <a href="#contact-conversion" className="text-xs font-bold px-4 py-2 rounded-lg text-white shadow-sm transition-transform active:scale-95" style={{ backgroundColor: primaryColor }}>
            {layout.heroSection?.ctaText || 'Get Quote'}
          </a>
        </div>
      </nav>

      {/* Hero Section Container */}
      <header className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center space-y-6">
        <span className="inline-block text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase bg-opacity-10" style={{ color: primaryColor, backgroundColor: `${primaryColor}20` }}>
          {layout.industry || 'Business Logistics'} 
          {layout.cityLocation ? ` • ${layout.cityLocation}` : ''}
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none max-w-3xl mx-auto">
          {layout.heroSection?.headline || 'High-Performing Custom Tailored Solutions'}
        </h1>
        <p className={`text-md md:text-lg max-w-xl mx-auto font-medium leading-relaxed ${themeIsDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {layout.heroSection?.subheadline || 'Providing dependable operational services built around speed and corporate processing performance benchmarks.'}
        </p>
      </header>

      {/* Dynamic Services Presentation Matrix */}
      {Array.isArray(layout.services) && layout.services.length > 0 && (
        <section className={`py-16 px-6 border-y ${themeIsDark ? 'bg-slate-900/20 border-slate-900' : 'bg-slate-100/60 border-slate-200'}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight mb-8">Specialty Client Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {layout.services.map((service: any, index: number) => (
                <div key={index} className={`p-6 rounded-2xl border transition-all ${themeIsDark ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center mb-4 font-mono text-xs font-bold bg-opacity-10" style={{ color: primaryColor, backgroundColor: `${primaryColor}20` }}>
                    0{index + 1}
                  </div>
                  <h3 className="text-md font-bold mb-2">{service.title || service}</h3>
                  <p className={`text-xs leading-relaxed ${themeIsDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {service.description || 'Premium industrial operations managed carefully to lock down maximum client return variables.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Corporate Narrative Component */}
      {layout.aboutUs?.story && (
        <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-black tracking-tight leading-none">Our Story & Standards</h2>
          </div>
          <div className={`md:col-span-2 text-sm leading-relaxed font-medium ${themeIsDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {layout.aboutUs.story}
          </div>
        </section>
      )}

      {/* Form Submission Block */}
      <section id="contact-conversion" className={`py-16 px-6 border-t ${themeIsDark ? 'bg-slate-900/10 border-slate-900' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`max-w-md mx-auto border rounded-2xl p-6 shadow-xl backdrop-blur-sm ${themeIsDark ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-100'}`}>
          <h2 className="text-xl font-black tracking-tight mb-1">Request Operational Callback</h2>
          <p className={`text-xs mb-4 font-medium ${themeIsDark ? 'text-slate-400' : 'text-slate-500'}`}>Submit details to sync prospect endpoints directly with our team.</p>
          
          {leadSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center text-xs font-mono font-bold text-emerald-400">
              Pipeline Entry Saved. Connection Processing!
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-3">
              <input type="text" placeholder="Contact Representative Name" required value={leadName} onChange={(e) => setLeadName(e.target.value)} className={`w-full p-3 text-xs rounded-xl border outline-none font-medium ${themeIsDark ? 'bg-slate-900 border-slate-800 focus:border-slate-700 text-white' : 'bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900'}`} />
              <input type="email" placeholder="Business Email Address" required value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} className={`w-full p-3 text-xs rounded-xl border outline-none font-medium ${themeIsDark ? 'bg-slate-900 border-slate-800 focus:border-slate-700 text-white' : 'bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900'}`} />
              <input type="tel" placeholder="Direct Line System Number" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} className={`w-full p-3 text-xs rounded-xl border outline-none font-medium ${themeIsDark ? 'bg-slate-900 border-slate-800 focus:border-slate-700 text-white' : 'bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900'}`} />
              <button type="submit" disabled={submittingLead} className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-[0.99] transition-all" style={{ backgroundColor: primaryColor }}>
                {submittingLead ? 'Logging Parameters...' : 'Secure Connection Line'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className={`py-8 text-center text-[10px] font-mono tracking-widest uppercase border-t ${themeIsDark ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
        System Pipeline Matrix • VoiceSites Factory
      </footer>
    </div>
  );
}