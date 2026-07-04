import { ensureTab, getRows, appendRow, updateRow, findRowIndexById } from '../lib/googleSheets';

const TAB = 'Accounts';
const HEADERS = ['id', 'company_name', 'industry', 'website', 'employee_count', 'created_at', 'updated_at'];

export const accountService = {
  async getAll() {
    await ensureTab(TAB, HEADERS);
    const rows = await getRows(`${TAB}!A2:G`);
    return rows.map(r => ({
      id: r[0],
      company_name: r[1],
      industry: r[2],
      website: r[3],
      employee_count: parseInt(r[4]) || 0,
      created_at: r[5],
      updated_at: r[6]
    }));
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const row = [id, data.company_name, data.industry, data.website, data.employee_count, now, now];
    await ensureTab(TAB, HEADERS);
    await appendRow(`${TAB}!A:G`, row);
    return { id, ...data, created_at: now, updated_at: now };
  },

  async update(id, data) {
    const idx = await findRowIndexById(TAB, id);
    if (idx < 0) throw new Error('Account not found');
    const now = new Date().toISOString();
    const row = [id, data.company_name, data.industry, data.website, data.employee_count, data.created_at, now];
    await updateRow(`${TAB}!A${idx}:G${idx}`, row);
    return { ...data, updated_at: now };
  }
};