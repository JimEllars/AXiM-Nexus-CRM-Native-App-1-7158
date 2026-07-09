import { supabase } from '../lib/supabase';

export const activityService = {
  async getAll() {
    const { data, error } = await supabase.from('activities').select('*');
    if (error) throw error;
    return data || [];
  },

  async getForEntity(entityId, page = 0, limit = 50) {
    const from = page * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from('crm.activity_log')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data || [];
  },

  async create(activityData) {
    const { data, error } = await supabase
      .from('activities')
      .insert([activityData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
