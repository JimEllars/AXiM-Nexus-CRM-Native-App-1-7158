import { createClient } from '@supabase/supabase-js';

const jsonResponse = (body, status) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' }
});

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
    const authorization = request.headers.get('Authorization');

    if (!supabaseUrl || !supabaseAnonKey || !authorization?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { error: authError } = await supabase.auth.getUser(authorization.slice(7));

    if (authError) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { to, subject, body: emailBody } = body;

    if (!to || !subject || !emailBody) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const resendApiKey = env.EMAIL_PROVIDER_API_KEY;

    if (!resendApiKey) {
      return jsonResponse({ error: 'Missing EMAIL_PROVIDER_API_KEY' }, 503);
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

    return jsonResponse({
      message: 'Email dispatched successfully',
      message_id: data.id
    }, 200);
  } catch (error) {
    console.error('Email delivery failed:', error);
    return jsonResponse({ error: 'Email delivery failed' }, 500);
  }
}
