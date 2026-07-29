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
  },

  async createTask(title) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, status: 'TODO', type: 'MANUAL', priority: 'NORMAL' }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleTaskCompletion(id, isCompleted) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: isCompleted ? 'DONE' : 'TODO' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTask(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
