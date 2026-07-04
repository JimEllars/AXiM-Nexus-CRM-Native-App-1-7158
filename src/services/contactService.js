import { ensureTab, getRows, appendRow, appendRows, updateRow, findRowIndexById } from '../lib/googleSheets';

const TAB = 'Contacts';
const HEADERS = ['id', 'account_id', 'first_name', 'last_name', 'email', 'phone', 'type', 'created_at', 'updated_at'];

export const contactService = {
  async getAll() {
    await ensureTab(TAB, HEADERS);
    const rows = await getRows(`${TAB}!A2:I`);
    return rows.map(r => ({
      id: r[0],
      account_id: r[1],
      first_name: r[2],
      last_name: r[3],
      email: r[4],
      phone: r[5],
      type: r[6],
      created_at: r[7],
      updated_at: r[8]
    }));
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const row = [id, data.account_id || '', data.first_name, data.last_name, data.email, data.phone, data.type, now, now];
    await ensureTab(TAB, HEADERS);
    await appendRow(`${TAB}!A:I`, row);
    return { id, ...data, created_at: now, updated_at: now };
  },

  async bulkCreate(contactsArray) {
    await ensureTab(TAB, HEADERS);
    const now = new Date().toISOString();
    const rows = contactsArray.map(data => [
      crypto.randomUUID(),
      data.account_id || '',
      data.first_name,
      data.last_name,
      data.email,
      data.phone,
      data.type || 'B2B_LEAD',
      now,
      now
    ]);
    
    await appendRows(`${TAB}!A:I`, rows);
    
    return rows.map(r => ({
      id: r[0],
      account_id: r[1],
      first_name: r[2],
      last_name: r[3],
      email: r[4],
      phone: r[5],
      type: r[6],
      created_at: r[7],
      updated_at: r[8]
    }));
  }
};