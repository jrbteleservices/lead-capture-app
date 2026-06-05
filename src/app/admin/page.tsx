'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Supabase Query Error:", error);
      } else {
        setLeads(data || []);
      }
      setLoading(false);
    }

    loadLeads();
  }, []);

  const handleUpdate = async () => {
    // 1. Fetch latest record
    const { data: record, error: fetchError } = await supabase
      .from('websites')
      .select('site_data')
      .eq('subdomain', 'test-bpo')
      .single();

    if (fetchError || !record) {
      alert("Could not fetch current site data.");
      return;
    }

    // 2. Update object while preserving existing keys
    const updatedData = {
      ...record.site_data,
      heroSection: {
        ...record.site_data.heroSection,
        headline: headline || record.site_data.heroSection.headline,
        subheadline: subheadline || record.site_data.heroSection.subheadline
      }
    };

    // 3. Update Supabase
    const { error } = await supabase
      .from('websites')
      .update({ site_data: updatedData })
      .eq('subdomain', 'test-bpo');

    if (error) alert("Update failed: " + error.message);
    else alert("Updated successfully!");
  };

  return (
    <div className="p-10 text-white min-h-screen bg-slate-950">
      <h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>
      
      <div className="mb-10 p-6 bg-slate-900 rounded border border-slate-800">
        <label className="block mb-2">Headline:</label>
        <input
          className="bg-slate-800 text-white p-2 mb-4 w-full rounded border border-slate-700"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Enter new headline" 
        />

        <label className="block mb-2">Subheadline:</label>
        <input
          className="bg-slate-800 text-white p-2 mb-4 w-full rounded border border-slate-700"
          value={subheadline}
          onChange={(e) => setSubheadline(e.target.value)}
          placeholder="Enter new subheadline" 
        />

        <button
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full font-bold"
          onClick={handleUpdate}
        >
          Update All Data
        </button>
      </div>

      <div className="mt-10 p-6 bg-slate-900 rounded border border-slate-800">
        <h2 className="text-xl font-bold mb-4 text-white">Recent Leads</h2>
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
                <tr key={lead.id} className="border-b border-slate-800">
                  <td className="p-2">{lead.name}</td>
                  <td className="p-2">{lead.email}</td>
                  <td className="p-2">{lead.phone_number || 'N/A'}</td>
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