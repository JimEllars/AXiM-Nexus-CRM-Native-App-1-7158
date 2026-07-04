import { supabase } from '../lib/supabase';

export const activityService = {
  async getAll() {
    const { data, error } = await supabase.from('activities').select('*');
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
