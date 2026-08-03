import { supabase } from '../lib/supabase';

export const contactService = {
  async getAll(page = 1, pageSize = 50, searchQuery = '', sortConfig = { field: 'created_at', ascending: false }, statusFilter = 'All') {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let query = supabase.from('contacts').select('*', { count: 'exact' }).range(from, to).order(sortConfig.field, { ascending: sortConfig.ascending, nullsFirst: false });

    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    if (statusFilter === 'Enriched') {
      query = query.eq('enrichment_status', 'ENRICHED');
    } else if (statusFilter === 'Pending') {
      // Pending can be null or 'PENDING'
      query = query.or('enrichment_status.eq.PENDING,enrichment_status.is.null');
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
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
  },

  async bulkDelete(ids) {
    const { data, error } = await supabase
      .from('contacts')
      .delete()
      .in('id', ids);
    if (error) throw error;
    return data;
  },

  async bulkImportContacts(chunk) {
    const { data, error } = await supabase
      .from('contacts')
      .insert(chunk)
      .select();

    if (error) throw error;
    return data || [];
  }
};
