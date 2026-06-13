import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Paste your copied Make.com Custom Webhook link target here
const MAKE_WEBHOOK_URL = process.env.MAKE_AUTOMATION_WEBHOOK_URL || 'https://hook.us2.make.com/22aa45aq1hxqo2e45z7qxrkrv296rh6a';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadName, leadEmail, leadPhone, industryContext } = body;

    if (!leadEmail) {
      return NextResponse.json({ error: 'Missing lead validation parameters.' }, { status: 400 });
    }

    // High-performance B2B system prompting
    const systemPrompt = `
      You are an automated B2B lead generation intelligence router for Teletransformers AI.
      Analyze the incoming prospect parameters and output a raw JSON object containing exactly:
      1. "leadScore": (Number from 1-100 evaluating premium B2B corporate potential)
      2. "priority": ("HIGH", "MEDIUM", or "LOW")
      3. "recommendedScriptAngle": (A short, targeted cold-calling approach optimized for an outbound Vapi voice agent)
      
      Respond ONLY with valid JSON. No markdown formatting, no trailing notes.
    `;

    const prospectDetails = `
      Name: ${leadName || 'Unknown'}
      Email: ${leadEmail}
      Phone Line: ${leadPhone || 'Not Provided'}
      Context/Industry: ${industryContext || 'General B2B Inbound'}
    `;

    // Fire it to the lightning-fast 2.5 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nProspect:\n${prospectDetails}` }] }
      ]
    });

    const rawText = response.text?.trim() || '{}';
    
    // Clean up markdown wrappers safely
    const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const analysisPayload = JSON.parse(cleanedText);

    // 🚀 NEW: Hook routing out to the Make.com Automation Engine
    let webhookStatus = 'deferred';
    if (MAKE_WEBHOOK_URL && !MAKE_WEBHOOK_URL.includes('YOUR_MAKE_COM_WEBHOOK_URL')) {
      try {
        const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: industryContext,
            leadInfo: {
              name: leadName,
              email: leadEmail,
              phone: leadPhone || 'N/A'
            },
            aiMetrics: analysisPayload
          })
        });
        
        if (makeResponse.ok) {
          webhookStatus = 'dispatched';
        } else {
          webhookStatus = `failed_status_${makeResponse.status}`;
        }
      } catch (webhookErr) {
        console.error('Make.com link delivery error:', webhookErr);
        webhookStatus = 'network_error';
      }
    }

    return NextResponse.json({
      success: true,
      analysis: analysisPayload,
      automationLine: webhookStatus
    });

  } catch (error: any) {
    console.error('Gemini Router Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Internal pipeline processing exception.' 
    }, { status: 500 });
  }
}