import { supabase } from '../lib/supabase';

export const workflowService = {
  async getAll() {
    const { data, error } = await supabase.from('workflows').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(workflowData) {
    const { data, error } = await supabase
      .from('workflows')
      .insert([workflowData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggle(id, is_active) {
    const { data, error } = await supabase
      .from('workflows')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
