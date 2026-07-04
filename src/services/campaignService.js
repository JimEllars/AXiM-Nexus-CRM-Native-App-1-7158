import { supabase } from '../lib/supabase';

export const campaignService = {
  async getAll() {
    const { data, error } = await supabase.from('campaigns').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(campaignData) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaignData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
