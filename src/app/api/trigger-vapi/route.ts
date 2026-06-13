import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, script } = body;

    const apiKey = process.env.VAPI_API_KEY;
    const assistantId = process.env.NEXT_PUBLIC_AGENCY_VAPI_ID;
    // 👇 Pull your connected outbound number line variable
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

    // 1. Production Diagnostics Environment Check
    if (!apiKey || !assistantId || !phoneNumberId) {
      console.error("❌ Environment Error: Missing keys.", { 
        apiKey: !!apiKey, 
        assistantId: !!assistantId,
        phoneNumberId: !!phoneNumberId 
      });
      return NextResponse.json({ 
        success: false, 
        error: "Configuration credentials missing in .env.local setup." 
      }, { status: 500 });
    }

    const cleanDialTarget = phone.startsWith('+') ? phone : `+${phone}`;
    console.log(`📡 Launching channel route. Outbound Line ID: ${phoneNumberId} -> Dial Target: ${cleanDialTarget}`);

    // 2. Dispatch Direct Request Package to Vapi Infrastructure
    const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        assistantId: assistantId,
        phoneNumberId: phoneNumberId, // ⚡ Authenticates your caller ID channel line
        customer: {
          number: cleanDialTarget
        },
        assistantOverrides: {
          firstMessage: script // Overrides core greeting with Gemini's tailored script opener
        }
      })
    });

    const data = await vapiResponse.json();

    // 3. Inspect Response Telemetry
    if (!vapiResponse.ok) {
      console.error('❌ VAPI SERVER REJECTED CALL LAYOUT:', JSON.stringify(data, null, 2));
      return NextResponse.json({ success: false, error: data.message || 'Call rejection.' }, { status: vapiResponse.status });
    }

    console.log('✅ VAPI CALL CHANNEL EXECUTED SUCCESSFULLY:', data.id);
    return NextResponse.json({ success: true, callId: data.id });

  } catch (error: any) {
    console.error('💥 Core Route Crash Exception:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}