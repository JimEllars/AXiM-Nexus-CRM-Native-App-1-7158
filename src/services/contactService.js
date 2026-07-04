import { supabase } from '../lib/supabase';

export const contactService = {
  async getAll() {
    const { data, error } = await supabase.from('contacts').select('*');
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
