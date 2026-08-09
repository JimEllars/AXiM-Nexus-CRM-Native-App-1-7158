import { createClient } from '@supabase/supabase-js';

const jsonResponse = (body, status) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' }
});

export async function onRequestPost(context) {
  try {
    const { env } = context;

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: 'Supabase credentials not configured' }, 503);
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Query pending B2B contacts
    const { data: contacts, error: fetchError } = await supabase
      .from('contacts')
      .select('id, company')
      .eq('enrichment_status', 'pending')
      .not('company', 'is', null)
      .limit(50);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return jsonResponse({ error: 'Failed to fetch pending contacts' }, 500);
    }

    if (!contacts || contacts.length === 0) {
      return jsonResponse({ message: 'No pending B2B contacts to enrich', processed: 0 }, 200);
    }

    // Simulate enrichment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update contacts
    const enrichedContacts = contacts.map(contact => ({
      id: contact.id,
      enrichment_status: 'enriched',
      // Dummy firmographic data
      company_industry: 'Technology',
      company_employee_count: '100-500'
    }));

    // We update contacts in a batch or one by one
    // Let's do it in a batched upsert
    const { error: updateError } = await supabase
      .from('contacts')
      .upsert(enrichedContacts);

    if (updateError) {
      console.error('Update error:', updateError);
      return jsonResponse({ error: 'Failed to update enriched contacts' }, 500);
    }

    return jsonResponse({
      message: 'Enrichment complete',
      processed: contacts.length
    }, 200);
  } catch (error) {
    console.error('Process error:', error);
    return jsonResponse({ error: 'Internal Server Error' }, 500);
  }
}
