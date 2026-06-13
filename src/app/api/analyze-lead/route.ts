import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MAKE_WEBHOOK_URL = process.env.MAKE_AUTOMATION_WEBHOOK_URL || 'https://hook.us2.make.com/jmyiv5ho3c5zakbnqn3xgnv4cj6sl43u';

/**
 * Enterprise Phone Sanitizer (E.164 Compliance)
 */
function sanitizeToGlobalStandard(phone: string, email: string): string {
  let digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;

  const domain = email.toLowerCase().trim();
  if (domain.endsWith('.co.uk') || domain.endsWith('.uk')) {
    if (digits.startsWith('0')) digits = digits.substring(1);
    return `+44${digits}`;
  } 
  if (digits.startsWith('0')) digits = digits.substring(1);
  return `+91${digits}`;
}

/**
 * Smart Domain Context Engine
 */
function inferIndustryFromEmail(email: string): string {
  const domain = email.toLowerCase().trim().split('@')[1] || '';
  if (domain.includes('construction') || domain.includes('build')) return `Commercial Construction Sector: ${domain}`;
  if (domain.includes('telesales') || domain.includes('bpo')) return `Outbound Sales Agency: ${domain}`;
  return `General Business Entity: ${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadName, leadEmail, leadPhone } = body;

    if (!leadEmail) return NextResponse.json({ error: 'Missing Email' }, { status: 400 });

    const pristineGlobalPhone = sanitizeToGlobalStandard(leadPhone || '', leadEmail);
    const calculatedContext = inferIndustryFromEmail(leadEmail);

    // 1. AI Analysis with Diagnostic Safety Wrappers
    let analysisPayload = { 
      leadScore: 50, 
      priority: 'MEDIUM', 
      recommendedScriptAngle: '⚠️ AI ANALYSIS UNAVAILABLE: Check API Quota' 
    };

    try {
      const systemPrompt = `Analyze prospect as a B2B lead. Respond ONLY in JSON: {"leadScore": number, "priority": "HIGH"|"MEDIUM"|"LOW", "recommendedScriptAngle": string}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\nProspect: ${leadName}, ${leadEmail}, Context: ${calculatedContext}` }] }]
      });

      const rawText = response.text?.trim() || '{}';
      const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      analysisPayload = JSON.parse(cleanedText);
    } catch (e) {
      console.error("AI Pipeline Failure (Quota or Parse):", e);
    }

    const liveScore = analysisPayload.leadScore || 50;
    const livePriority = (analysisPayload.priority || 'MEDIUM').toUpperCase();
    const liveHook = analysisPayload.recommendedScriptAngle || 
                     '🚀 AI-READY: Awaiting custom script generation...';

    // 2. Database Sync
    const { error: dbError } = await supabase
      .from('leads')
      .insert([ {
        tenant_id: '85e22b61-913a-4053-81f2-005cfb5c7bf5',
        name: leadName || 'Unknown Prospect',
        email: leadEmail,
        phone: pristineGlobalPhone,
        phone_number: pristineGlobalPhone,
        score: Number(liveScore),
        priority: livePriority,
        script_angle: liveHook
      }]);

    if (dbError) throw dbError;

    // 3. Webhook Dispatch
    if (MAKE_WEBHOOK_URL) {
      fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadName, leadEmail, liveScore, livePriority, liveHook })
      }).catch(console.warn);
    }

    return NextResponse.json({ success: true, analysis: { liveScore, livePriority, liveHook } });

  } catch (error: any) {
    console.error('Fatal Pipeline Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}