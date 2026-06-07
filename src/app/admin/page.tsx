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

      if (error) console.error("Error loading leads:", error);
      else setLeads(data || []);
      setLoading(false);
    }
    loadLeads();
  }, []);

  const handleUpdate = async () => {
    try {
      // 1. Fetch latest state from DB
      const { data: record, error: fetchError } = await supabase
        .from('websites')
        .select('site_data')
        .eq('subdomain', 'test-bpo')
        .single();

      if (fetchError || !record) throw new Error("Could not fetch site data.");

      // 2. Merge inputs with existing data
      const updatedData = {
        ...record.site_data,
        heroSection: {
          ...record.site_data.heroSection,
          headline: headline || record.site_data.heroSection.headline,
          subheadline: subheadline || record.site_data.heroSection.subheadline
        }
      };

      // 3. Update Supabase
      const { error: updateError } = await supabase
        .from('websites')
        .update({ site_data: updatedData })
        .eq('subdomain', 'test-bpo');

      if (updateError) throw updateError;
      alert("Updated successfully!");
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  };

  return (
    <div className="p-10 text-white min-h-screen bg-slate-950">
      <h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>
      
      <div className="mb-10 p-6 bg-slate-900 rounded border border-slate-800">
        <label className="block mb-2 text-slate-300">Headline:</label>
        <input
          className="bg-slate-800 text-white p-3 mb-4 w-full rounded border border-slate-700 focus:border-blue-500 outline-none"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Enter new headline" 
        />

        <label className="block mb-2 text-slate-300">Subheadline:</label>
        <input
          className="bg-slate-800 text-white p-3 mb-4 w-full rounded border border-slate-700 focus:border-blue-500 outline-none"
          value={subheadline}
          // Change this line from setHeadline to setSubheadline
          onChange={(e) => setSubheadline(e.target.value)}
          placeholder="Enter new subheadline" 
        />

        <button
          className="bg-blue-600 px-6 py-3 rounded font-bold hover:bg-blue-700 w-full transition"
          onClick={handleUpdate}
        >
          Update All Data
        </button>
      </div>

      <div className="mt-10 p-6 bg-slate-900 rounded border border-slate-800">
        <h2 className="text-xl font-bold mb-4">Recent Leads</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-3 text-center">Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={4} className="p-3 text-center text-slate-500">No leads found.</td></tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-3">{lead.name}</td>
                  <td className="p-3">{lead.email}</td>
                  <td className="p-3">{lead.phone_number || 'N/A'}</td>
                  <td className="p-3">{new Date(lead.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'use client';
import { toast } from 'sonner';

// ... inside your save/update function
const handleUpdate = async () => {
  try {
    // 1. Perform your database update
    // const { data, error } = await supabase...
    
    // 2. Show the success toast
    toast.success('Changes saved successfully!');
  } catch (error) {
    // 3. Show the error toast if something goes wrong
    toast.error('Failed to save changes.');
  }
};