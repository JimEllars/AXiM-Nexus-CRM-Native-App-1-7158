import { ensureTab, getRows, appendRow, updateRow, findRowIndexById } from '../lib/googleSheets';

const TAB = 'Tasks';
const HEADERS = ['id', 'title', 'deal_id', 'contact_id', 'priority', 'status', 'due_date', 'type', 'created_at', 'updated_at'];

export const taskService = {
  async getAll() {
    await ensureTab(TAB, HEADERS);
    const rows = await getRows(`${TAB}!A2:J`);
    return rows.map(r => ({
      id: r[0],
      title: r[1],
      deal_id: r[2],
      contact_id: r[3],
      priority: r[4],
      status: r[5],
      due_date: r[6],
      type: r[7],
      created_at: r[8],
      updated_at: r[9]
    }));
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const row = [
      id, data.title, data.deal_id || '', data.contact_id || '',
      data.priority, data.status || 'TODO', data.due_date, data.type, now, now
    ];
    await ensureTab(TAB, HEADERS);
    await appendRow(`${TAB}!A:J`, row);
    return { id, ...data, created_at: now, updated_at: now };
  },

  async update(id, data) {
    const idx = await findRowIndexById(TAB, id);
    if (idx < 0) throw new Error('Task not found');
    const now = new Date().toISOString();
    const row = [
      id, data.title, data.deal_id || '', data.contact_id || '',
      data.priority, data.status, data.due_date, data.type, data.created_at, now
    ];
    await updateRow(`${TAB}!A${idx}:J${idx}`, row);
    return { ...data, updated_at: now };
  }
};