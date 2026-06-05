import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PageProps {
  searchParams: Promise<{ site?: string }>;
}

// 🌐 UNIVERSAL SERVER-SIDE ARCHITECTURE RENDER ENGINE
export default async function DynamicStorefrontHome(props: PageProps) {
  // Explicitly await the searchParams to make TypeScript perfectly happy
  const searchParams = await props.searchParams;
  const requestedSite = searchParams.site;

  // 1. If no parameter is provided, show the welcoming guide screen
  if (!requestedSite) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <p className="text-amber-400 font-medium text-sm border border-amber-500/30 bg-amber-500/5 px-4 py-3 rounded-xl mb-4">
            Welcome to VoiceSites! To preview a dynamic site, add '?site=your-subdomain' to the browser address link bar.
          </p>
        </div>
      </div>
    );
  }

  // 2. Query Supabase directly on the server side—bypassing local HTTP network limitations entirely!
 // Log the request to tracking
  console.log("🔍 Fetching database record for subdomain:", requestedSite.trim().toLowerCase());

  const { data: websiteRecord, error } = await supabase
  .from('websites')
  .select('site_data, is_active')
  .eq('subdomain', requestedSite.trim().toLowerCase())
  .maybeSingle(); // .maybeSingle() is safer than .single() as it won't error if 0 rows are found

  if (error) {
    console.error("❌ Supabase Engine Error Payload:", error.message, "Details:", error.details);
  } else {
    console.log("✅ Row retrieved successfully! Payload:", websiteRecord);
  }

  // 3. Handle missing database records or account suspensions
  if (error || !websiteRecord || !websiteRecord.site_data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <p className="text-amber-400 font-medium text-sm border border-amber-500/30 bg-amber-500/5 px-4 py-3 rounded-xl">
            A connection error occurred: Subdomain "{requestedSite}" not found in our database records.
          </p>
        </div>
      </div>
    );
  }

  // Check if account status is toggled off
  if (!websiteRecord.is_active) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <p className="text-rose-400 font-medium text-sm border border-rose-500/30 bg-rose-500/5 px-4 py-3 rounded-xl">
            This website instance is currently suspended. Contact your operations controller.
          </p>
        </div>
      </div>
    );
  }

  const data = websiteRecord.site_data as any;

  // 4. PAINT THE FRONTEND STOREFRONT OVER THE RETRIEVED SCHEMA DATA
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* HERO SECTION CONTAINER */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center flex flex-col items-center justify-center">
        <div className="absolute top-10 left-6 text-xs font-mono tracking-widest text-slate-500 uppercase">
          ⚡ Powered by VoiceSites
        </div>
        
        <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border bg-cyan-500/5 text-cyan-400 border-cyan-500/20 mb-4">
          {data.industry || 'Verified Enterprise Business'}
        </span>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight mb-6">
          {data.heroSection?.headline || 'Operational Architecture Transformed'}
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
          {data.heroSection?.subheadline || 'Delivering premium automated solutions tailored to scale dynamic industry pipelines.'}
        </p>
        
        <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/10 hover:opacity-95 transition transform hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide uppercase">
          {data.heroSection?.ctaText || 'Get Started Now'}
        </button>
      </section>

      {/* DYNAMIC SERVICES RENDER GRID */}
      {data.services && data.services.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900">
          <h2 className="text-xs font-mono tracking-widest text-cyan-400 uppercase mb-8">Core Business Framework</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.services.map((srv: any, idx: number) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center text-cyan-400 text-lg mb-4 font-mono font-bold">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{srv.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{srv.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CORPORATE IDENTITY SECTION */}
      {data.aboutUs?.story && (
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900 mb-12">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-900 flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="max-w-md">
              <h2 className="text-xs font-mono tracking-widest text-indigo-400 uppercase mb-3">Operational Background</h2>
              <h3 className="text-2xl font-black text-white tracking-tight">{data.businessName || 'Our Identity'}</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl md:pt-6">
              {data.aboutUs.story}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
export default function AdminDashboard() {
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Replace with your actual tenant ID
  const tenantId = '85e22b61-913a-4053-81f2-005cfb5c7bf5';

  useEffect(() => {
    async function loadLeads() {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Query Error:", error.message);
      } else {
        setLeads(data || []);
      }
      setLoading(false);
    }

    loadLeads(); // <-- THIS WAS MISSING
  }, []);

  const handleUpdate = async () => {
    const { data: record } = await supabase
      .from('websites')
      .select('site_data')
      .eq('subdomain', 'test-bpo')
      .single();

    if (!record) return;

    const updatedData = {
      ...record.site_data,
      heroSection: {
        ...record.site_data.heroSection,
        headline: headline,
        subheadline: subheadline
      }
    };

    const { error } = await supabase
      .from('websites')
      .update({ site_data: updatedData })
      .eq('subdomain', 'test-bpo');

    if (error) alert("Update failed: " + error.message);
    else alert("Updated successfully!");
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>

      <label className="block mb-2">Headline:</label>
      <input
        className="bg-slate-800 text-white p-2 mb-4 w-full border border-slate-600 rounded"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Enter new headline" />

      <label className="block mb-2">Subheadline:</label>
      <input
        className="bg-slate-800 text-white p-2 mb-4 w-full border border-slate-600 rounded"
        value={subheadline}
        onChange={(e) => setSubheadline(e.target.value)}
        placeholder="Enter new subheadline" />

      <button
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleUpdate}
      >
        Update All Data
      </button>

      <div className="mt-10 p-6 bg-slate-900 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-white">Captured Leads</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-2 text-center">Loading...</td></tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-800 text-white">
                  <td className="p-2">{lead.name}</td>
                  <td className="p-2">{lead.email}</td>
                  <td className="p-2">{lead.phone_number || "N/A"}</td>
                  <td className="p-2">{new Date(lead.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
