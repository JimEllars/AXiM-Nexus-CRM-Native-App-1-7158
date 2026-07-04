import { supabase } from '../lib/supabase';

export const dealService = {
  async getAll() {
    const { data, error } = await supabase.from('deals').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(dealData) {
    const { data, error } = await supabase
      .from('deals')
      .insert([dealData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, dealData) {
    const { data, error } = await supabase
      .from('deals')
      .update(dealData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
