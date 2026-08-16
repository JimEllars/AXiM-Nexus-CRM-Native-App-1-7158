const jsonResponse = (body, status) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' }
});

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const authorization = request.headers.get('Authorization');

    // Authenticate using context.env.NEXUS_API_SECRET
    if (!authorization || authorization !== `Bearer ${env.NEXUS_API_SECRET}`) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { to_phone, message } = body;

    if (!to_phone || !message) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const twilioSid = env.TWILIO_ACCOUNT_SID;
    const twilioToken = env.TWILIO_AUTH_TOKEN;

    if (!twilioSid || !twilioToken) {
      return jsonResponse({ error: 'Missing Twilio credentials' }, 503);
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const twilioPhone = env.TWILIO_PHONE_NUMBER || '+12345678901'; // Default

    const payload = new URLSearchParams();
    payload.append('To', to_phone);
    payload.append('From', twilioPhone);
    payload.append('Body', message);

    const authHeader = 'Basic ' + btoa(`${twilioSid}:${twilioToken}`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payload.toString()
    });

    const data = await res.json();

    if (!res.ok) {
       throw new Error(data.message || 'Failed to send SMS via Twilio');
    }

    return jsonResponse({
      message: 'SMS dispatched successfully',
      message_id: data.sid
    }, 200);
  } catch (error) {
    console.error('SMS delivery failed:', error);
    return jsonResponse({ error: 'SMS delivery failed' }, 500);
  }
}
