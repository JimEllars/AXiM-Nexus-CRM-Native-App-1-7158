import { supabase } from '../lib/supabase';

export const contactService = {
  async getAll(offset = 0, searchQuery = '') {
    let query = supabase.from('contacts').select('*').range(offset, offset + 49).limit(50);

    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async bulkCreate(contactsArray) {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contactsArray)
      .select();
    if (error) throw error;
    return data || [];
  }
};
