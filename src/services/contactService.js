import { notificationService } from './notificationService';
import { supabase } from '../lib/supabase';

export const contactService = {

  async mergeContacts(masterId, duplicateId, mergedData) {
    try {
      // 1. Update master record with merged data
      const { error: updateError } = await supabase
        .from('contacts')
        .update(mergedData)
        .eq('id', masterId);

      if (updateError) throw updateError;

      // 2. Delete duplicate record
      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .eq('id', duplicateId);

      if (deleteError) throw deleteError;

      // Import notification service at top or assume it's used by caller
      // Wait, we need to import it if we want to use it here.
      // The task says "Upon success, trigger notificationService.notifySuccess('Records successfully merged.') and re-fetch the Directory data."
      // It's probably cleaner to have the caller do it, or import notificationService here.
      // Let's import notificationService here.

      return true;
    } catch (error) {
      console.error('Error merging contacts:', error);
      throw error;
    }
  },

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


  async bulkAssignContacts(contactIds, agentId) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ assigned_to: agentId })
        .in('id', contactIds)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error assigning contacts:', error);
      throw error;
    }
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
