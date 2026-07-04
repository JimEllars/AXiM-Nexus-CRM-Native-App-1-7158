import { supabase } from '../lib/supabase';

export const accountService = {
  async getAll() {
    const { data, error } = await supabase.from('accounts').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(data) {
    const { data: newAccount, error } = await supabase
      .from('accounts')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return newAccount;
  },

  async update(id, data) {
    const { data: updatedAccount, error } = await supabase
      .from('accounts')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updatedAccount;
  }
};
