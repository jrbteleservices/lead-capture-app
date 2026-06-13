import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const { record } = await req.json(); // Data from the queue
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // 1. Call Gemini with retry logic
  // 2. Insert into 'leads' table
  // 3. Delete from 'pending_leads'
  
  return new Response(JSON.stringify({ success: true }), { status: 200 });
});