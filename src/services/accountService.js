import { supabase } from '../lib/supabase';

export const accountService = {
  async getAll(offset = 0, searchQuery = '') {
    let query = supabase.from('accounts').select('*').range(offset, offset + 49).limit(50);

    if (searchQuery) {
      query = query.or(`company_name.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
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
