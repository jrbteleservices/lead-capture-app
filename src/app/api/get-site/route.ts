import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(req: Request) {
  try {
    // Look at the incoming URL query (e.g., /api/get-site?subdomain=pizza-place)
    const { searchParams } = new URL(req.url);
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain parameter is missing' }, { status: 400 });
    }

    // Search inside our Supabase table for a row matching this clean subdomain name
    const { data, error } = await supabase
      .from('websites')
      .select('site_data, is_active')
      .eq('subdomain', subdomain.toLowerCase())
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Website not found on our servers' }, { status: 404 });
    }

    if (!data.is_active) {
      return NextResponse.json({ error: 'This website account is currently suspended or unpaid' }, { status: 403 });
    }

    // Send the beautiful custom website layout back to the screen viewer
    return NextResponse.json({ success: true, siteData: data.site_data });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}