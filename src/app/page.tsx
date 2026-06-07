'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PublicSubdomainStorefront() {
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Form State for capturing customer leads directly on this storefront
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    async function resolveSubdomainData() {
      try {
        if (typeof window === 'undefined') return;

        const hostname = window.location.hostname;
        let detectedSubdomain = '';

        // Handle local testing environments vs live production domains
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
          // Hardcoded for your local debugging convenience; swap to check production behaviors
          detectedSubdomain = 'test-bpo'; 
        } else {
          // Splits out 'subdomain.voicesites.app' -> 'subdomain'
          const parts = hostname.split('.');
          if (parts.length > 2) {
            detectedSubdomain = parts[0].toLowerCase();
          }
        }

        if (!detectedSubdomain || detectedSubdomain === 'www') {
          setErrorState('Main Root Domain View. Please access via a custom business link.');
          setLoading(false);
          return;
        }

        // Fetch our rich JSONB configuration directly from Supabase
        const { data: websiteRow, error: dbError } = await supabase
          .from('websites')
          .select('*')
          .eq('subdomain', detectedSubdomain)
          .single();

        if (dbError || !websiteRow) {
          setErrorState(`Business storefront "${detectedSubdomain}" could not be located.`);
        } else {
          setSiteData(websiteRow);
        }
      } catch (err) {
        console.error('Subdomain resolving error:', err);
        setErrorState('Failed to process platform execution layers.');
      } finally {
        setLoading(false);
      }
    }

    resolveSubdomainData();
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    setSubmittingLead(true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            tenant_id: '85e22b61-913a-4053-81f2-005cfb5c7bf5', // Associated alpha tracking ID
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
      console.error('Lead conversion failure:', err);
    } finally {
      setSubmittingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-xs">
        <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
        Synchronizing Distributed Data Vectors...
      </div>
    );
  }

  if (errorState || !siteData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-slate-300 font-sans">
        <div className="border border-slate-900 bg-slate-900/20 max-w-sm rounded-2xl p-6">
          <h1 className="text-sm font-mono tracking-widest text-slate-500 uppercase mb-2">Platform System Status</h1>
          <p className="text-sm font-medium text-slate-400">{errorState || 'Storefront Offline'}</p>
        </div>
      </div>
    );
  }

  // Safely map out our rich AI generated JSON parameters
  const layout = siteData.site_data || {};
  const primaryColor = layout.branding?.primaryColor || '#10b981'; 
  const themeIsDark = layout.branding?.themeMode !== 'light';

  return (
    <div 
      className={`min-h-screen font-sans antialiased selection:bg-opacity-30 transition-colors duration-300 ${
        themeIsDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Dynamic Header Block */}
      <nav className={`border-b px-6 py-4 flex items-center justify-between ${themeIsDark ? 'border-slate-900 bg-slate-950/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md sticky top-0 z-50`}>
        <span className="text-lg font-black tracking-tight uppercase" style={{ color: primaryColor }}>
          {layout.businessName || 'VoiceSite Storefront'}
        </span>
        <a 
          href="#contact" 
          className="text-xs font-bold px-4 py-2 rounded-lg text-white transition-transform active:scale-95 shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          Get Quote
        </a>
      </nav>

      {/* Dynamic Hero Section */}
      <header className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center space-y-6">
        <span className="inline-block text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase bg-opacity-10" style={{ color: primaryColor, backgroundColor: `${primaryColor}20` }}>
          {layout.industry || 'Professional Services'}
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none max-w-3xl mx-auto">
          {layout.heroSection?.headline || 'High-Quality Tailored Industry Solutions'}
        </h1>
        <p className={`text-md md:text-xl max-w-xl mx-auto font-medium leading-relaxed ${themeIsDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {layout.heroSection?.subheadline || 'Providing dependable commercial and retail operational support options designed around speed and performance efficiency details.'}
        </p>
      </header>

      {/* Dynamic Services Array Mapping Grid */}
      {Array.isArray(layout.services) && layout.services.length > 0 && (
        <section className={`py-16 px-6 border-y ${themeIsDark ? 'bg-slate-900/20 border-slate-900' : 'bg-slate-100/60 border-slate-200'}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight mb-8">Our Core Specialty Solutions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {layout.services.map((service: any, index: number) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-2xl border transition-all ${
                    themeIsDark ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-4 font-mono text-xs font-bold bg-opacity-10" style={{ color: primaryColor, backgroundColor: `${primaryColor}20` }}>
                    0{index + 1}
                  </div>
                  <h3 className="text-md font-bold mb-2">{service.title || service}</h3>
                  <p className={`text-xs leading-relaxed ${themeIsDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {service.description || 'Premium local business offerings tailored dynamically to guarantee absolute operational output excellence.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic About Us Block */}
      {layout.aboutUs?.story && (
        <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-black tracking-tight leading-none">Our Story & Core Standards</h2>
          </div>
          <div className={`md:col-span-2 text-sm leading-relaxed font-medium ${themeIsDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {layout.aboutUs.story}
          </div>
        </section>
      )}

      {/* Interactive Subdomain Lead Generation Form */}
      <section id="contact" className={`py-16 px-6 border-t ${themeIsDark ? 'bg-slate-900/10 border-slate-900' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`max-w-md mx-auto border rounded-2xl p-6 bg-opacity-40 shadow-xl backdrop-blur-sm ${themeIsDark ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-100'}`}>
          <h2 className="text-xl font-black tracking-tight mb-1">Connect With Us</h2>
          <p className={`text-xs mb-4 font-medium ${themeIsDark ? 'text-slate-400' : 'text-slate-500'}`}>Submit details below to initiate instant diagnostic callback loops.</p>
          
          {leadSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center text-xs font-mono font-bold text-emerald-400 animate-scaleUp">
              Request Logged. Team checking parameters now!
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-3">
              <input 
                type="text" 
                placeholder="Your Full Name" 
                required
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className={`w-full p-3 text-xs rounded-xl border outline-none font-medium ${themeIsDark ? 'bg-slate-900 border-slate-800 focus:border-slate-700 text-white' : 'bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900'}`}
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className={`w-full p-3 text-xs rounded-xl border outline-none font-medium ${themeIsDark ? 'bg-slate-900 border-slate-800 focus:border-slate-700 text-white' : 'bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900'}`}
              />
              <input 
                type="tel" 
                placeholder="Phone System Number (Optional)" 
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className={`w-full p-3 text-xs rounded-xl border outline-none font-medium ${themeIsDark ? 'bg-slate-900 border-slate-800 focus:border-slate-700 text-white' : 'bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900'}`}
              />
              <button 
                type="submit" 
                disabled={submittingLead}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-[0.99] transition-all duration-200"
                style={{ backgroundColor: primaryColor }}
              >
                {submittingLead ? 'Processing Ingest...' : 'Submit Contact Vector'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Public Storefront Footer Node */}
      <footer className={`py-8 text-center text-[10px] font-mono tracking-widest uppercase border-t ${themeIsDark ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
        Powered By VoiceSites Autonomous Architecture
      </footer>
    </div>
  );
}