import { ensureTab, getRows, appendRow } from '../lib/googleSheets';

const TAB = 'Campaigns';
const HEADERS = ['id', 'name', 'type', 'budget', 'status', 'created_at', 'updated_at'];

export const campaignService = {
  async getAll() {
    await ensureTab(TAB, HEADERS);
    const rows = await getRows(`${TAB}!A2:G`);
    return rows.map(r => ({
      id: r[0],
      name: r[1],
      type: r[2],
      budget: parseFloat(r[3]) || 0,
      status: r[4],
      created_at: r[5],
      updated_at: r[6]
    }));
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const row = [id, data.name, data.type, data.budget, data.status, now, now];
    await ensureTab(TAB, HEADERS);
    await appendRow(`${TAB}!A:G`, row);
    return { id, ...data, created_at: now, updated_at: now };
  }
};