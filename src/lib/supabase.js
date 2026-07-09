import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided')
}

// Dead Letter Queue Interceptor Stub
export const logToAsguardDLQ = (errorPayload) => {
  console.error('[ASGUARD-DLQ-ROUTING]', errorPayload);
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
