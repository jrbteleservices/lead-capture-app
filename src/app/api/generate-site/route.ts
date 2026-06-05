import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from './prompt';
import { supabase } from '../../../lib/supabase';
function validateWebsiteData(data: any): boolean {
  return (
    data &&
    typeof data.businessName === 'string' &&
    data.contact &&
    data.branding &&
    Array.isArray(data.services)
  );
}

export async function POST(req: Request) {
  try {
    const { transcript, subdomain, ownerEmail } = await req.json();

    // Strict validation check for input fields
    if (!transcript || !subdomain) {
      return NextResponse.json({ error: 'Missing transcript or desired subdomain input' }, { status: 400 });
    }

    // Clean up subdomain input string to avoid URL formatting issues
    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

    let rawJSONResponse = '';
    let parsedData = null;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts && !parsedData) {
      attempts++;
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: SYSTEM_PROMPT },
              { text: `Raw Business Transcript: "${transcript}"` }
            ]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      const jsonResult = await response.json();
      rawJSONResponse = jsonResult.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      try {
        const potentialData = JSON.parse(rawJSONResponse);
        if (validateWebsiteData(potentialData)) {
          parsedData = potentialData; 
        }
      } catch (e) {
        console.warn(`Attempt ${attempts} failed parsing. Retrying self-healing loop...`);
      }
    }

    if (!parsedData) {
      throw new Error('AI Engine failed to return a validated structure.');
    }

    // 🚀 THE MAGIC MOMENT: Write this brand new website state straight to Supabase!
    const { data: dbRow, error: dbError } = await supabase
      .from('websites')
      .insert([
        {
          subdomain: cleanSubdomain,
          owner_email: ownerEmail || null,
          site_data: parsedData // Storing the complete rich AI JSON layout data inside our JSONB column!
        }
      ])
      .select()
      .single();

    if (dbError) {
      // Handle cases where someone tries to steal a subdomain that already exists
      if (dbError.code === '23505') {
        return NextResponse.json({ success: false, error: 'This subdomain link is already taken by another business!' }, { status: 409 });
      }
      throw dbError;
    }

    // Return the successful database row details back to our front-end app system
    return NextResponse.json({ 
      success: true, 
      message: "Website created and stored autonomously!", 
      subdomain: dbRow.subdomain,
      id: dbRow.id 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}