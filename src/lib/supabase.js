import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided')
}

// Dead Letter Queue Interceptor Stub
export const logToAsguardDLQ = async (errorPayload) => {
  console.error('[ASGUARD-DLQ-ROUTING]', errorPayload);
  try {
    const interceptorUrl = import.meta.env.VITE_ASGUARD_INTERCEPTOR_URL || 'https://api.axim.us.com/v1/telemetry/ingress';
    await fetch(interceptorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: 'AXIM_NEXUS_CRM',
        event_type: 'HTTP_5XX_INTERCEPT',
        payload: errorPayload,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn('[ASGUARD-DLQ-DISPATCH-FAILED]', err);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: async (url, options) => {
      const response = await fetch(url, options);
      if (response.status >= 500) {
        let errorPayload = { url, status: response.status, method: options?.method };
        try {
          const clone = response.clone();
          errorPayload.body = await clone.text();
        } catch (e) {
          // ignore
        }
        logToAsguardDLQ(errorPayload);
      }
      return response;
    }
  }
});
