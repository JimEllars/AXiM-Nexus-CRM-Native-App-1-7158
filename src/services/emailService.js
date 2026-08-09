import { supabase } from '../lib/supabase';

export const emailService = {
  async sendTransactionalEmail(to, subject, body) {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In a real app we'd pass the authorization header here if available from context
        'Authorization': `Bearer ${import.meta.env.VITE_NEXUS_API_SECRET || 'dev-secret'}`
      },
      body: JSON.stringify({
        to,
        subject,
        body,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email dispatch failed with status: ${response.status}`);
    }

    return response.json();
  },

  async getTemplates() {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createTemplate(template) {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTemplate(id, updates) {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTemplate(id) {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
