import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    const expectedSecret = env.GROUNDGAME_WEBHOOK_SECRET;

    if (!expectedSecret) {
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), { status: 500 });
    }

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const payload = await request.json();

    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return new Response(JSON.stringify({ error: 'Database connection missing' }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { first_name, last_name, email, phone, groundgame_id } = payload;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required for UPSERT' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('contacts')
      .upsert({
        first_name,
        last_name,
        email,
        phone,
        groundgame_id,
        type: 'B2C_LEAD'
      }, {
        onConflict: 'email'
      })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to sync record' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Webhook processing error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
