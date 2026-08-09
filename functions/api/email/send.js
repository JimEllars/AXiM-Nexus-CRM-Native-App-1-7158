export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const authHeader = request.headers.get('Authorization');
    const secret = env.NEXUS_API_SECRET;

    // If the secret is set, require it
    if (secret && authHeader !== `Bearer ${secret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { to, subject, body: emailBody } = body;

    if (!to || !subject || !emailBody) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resendApiKey = env.EMAIL_PROVIDER_API_KEY;

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Missing EMAIL_PROVIDER_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'hello@axim.us.com',
        to: to,
        subject: subject,
        html: emailBody
      })
    });

    const data = await res.json();

    if (!res.ok) {
       throw new Error(data.message || 'Failed to send email via Resend');
    }

    return new Response(JSON.stringify({
      message: 'Email dispatched successfully',
      message_id: data.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
