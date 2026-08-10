import { createClient } from '@supabase/supabase-js';

const jsonResponse = (body, status) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' }
});

const validContactTypes = new Set(['B2B_LEAD', 'B2C_LEAD']);
const validSources = new Set(['GROUND_GAME_INTERNAL', 'AXIM_INTERNAL']);

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const authHeader = request.headers.get('Authorization');
    const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;

    if (!env.WEBHOOK_SECRET || !supabaseUrl || !serviceRoleKey || !env.AXIM_ORGANIZATION_ID) {
      return jsonResponse({ error: 'Webhook is not configured.' }, 503);
    }

    if (authHeader !== `Bearer ${env.WEBHOOK_SECRET}`) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > 1000000) {
      return jsonResponse({ error: 'Payload exceeds the 1 MB limit.' }, 413);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON payload' }, 400);
    }

    const { first_name, last_name, email, phone, source = 'GROUND_GAME_INTERNAL', type = 'B2C_LEAD' } = payload;

    if (!first_name || !last_name || !email || !validContactTypes.has(type) || !validSources.has(source)) {
      return jsonResponse({ error: 'first_name, last_name, email, and a valid B2B_LEAD or B2C_LEAD type are required.' }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert([{
        first_name,
        last_name,
        email,
        phone: phone || null,
        type,
        source,
        organization_id: env.AXIM_ORGANIZATION_ID
      }])
      .select()
      .single();

    if (contactError) {
      console.error('Inbound contact insert failed:', contactError.message);
      return jsonResponse({ error: 'Contact ingestion failed.' }, 500);
    }

    const { error: activityError } = await supabase
      .from('activities')
      .insert([{
        type: 'SYSTEM_ALERT',
        description: `New ${type} lead ingested through ${source}.`,
        organization_id: env.AXIM_ORGANIZATION_ID
      }]);

    if (activityError) {
      console.error('Inbound activity insert failed:', activityError.message);
    }

    return jsonResponse({ id: contact.id, message: 'Contact ingested.' }, 201);
  } catch (error) {
    console.error('Inbound webhook failed:', error);
    return jsonResponse({ error: 'Internal Server Error' }, 500);
  }
}
