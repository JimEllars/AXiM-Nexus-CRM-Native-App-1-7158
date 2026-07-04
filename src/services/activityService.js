import { ensureTab, getRows, appendRow } from '../lib/googleSheets';

const TAB = 'Activities';
const HEADERS = ['id', 'contact_id', 'deal_id', 'type', 'description', 'logged_by_agent_id', 'metadata', 'created_at'];

export const activityService = {
  async getAll() {
    await ensureTab(TAB, HEADERS);
    const rows = await getRows(`${TAB}!A2:H`);
    return rows.map(r => ({
      id: r[0],
      contact_id: r[1],
      deal_id: r[2],
      type: r[3],
      description: r[4],
      logged_by_agent_id: r[5],
      metadata: r[6] ? JSON.parse(r[6]) : {},
      created_at: r[7]
    }));
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const row = [
      id, data.contact_id || '', data.deal_id || '', data.type, 
      data.description, data.logged_by_agent_id || '', 
      JSON.stringify(data.metadata || {}), now
    ];
    await ensureTab(TAB, HEADERS);
    await appendRow(`${TAB}!A:H`, row);
    return { id, ...data, created_at: now };
  }
};