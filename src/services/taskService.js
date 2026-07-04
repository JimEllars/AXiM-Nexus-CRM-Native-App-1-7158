import { supabase } from '../lib/supabase';

export const taskService = {
  async getAll() {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
