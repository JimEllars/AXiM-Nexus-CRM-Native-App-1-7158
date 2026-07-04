import { ensureTab, getRows, appendRow, updateRow, findRowIndexById } from '../lib/googleSheets';

const TAB = 'Deals';
const HEADERS = ['id', 'campaign_id', 'account_id', 'primary_contact_id', 'title', 'amount', 'stage', 'probability_score', 'expected_close_date', 'created_at', 'updated_at'];

export const dealService = {
  async getAll() {
    await ensureTab(TAB, HEADERS);
    const rows = await getRows(`${TAB}!A2:K`);
    return rows.map(r => ({
      id: r[0],
      campaign_id: r[1],
      account_id: r[2],
      primary_contact_id: r[3],
      title: r[4],
      amount: parseFloat(r[5]) || 0,
      stage: r[6],
      probability_score: parseInt(r[7]) || 0,
      expected_close_date: r[8],
      created_at: r[9],
      updated_at: r[10]
    }));
  },

  async create(data) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const row = [
      id, data.campaign_id || '', data.account_id || '', data.primary_contact_id || '',
      data.title, data.amount, data.stage, data.probability_score || 0,
      data.expected_close_date || '', now, now
    ];
    await ensureTab(TAB, HEADERS);
    await appendRow(`${TAB}!A:K`, row);
    return { id, ...data, created_at: now, updated_at: now };
  },

  async update(id, data) {
    const idx = await findRowIndexById(TAB, id);
    if (idx < 0) throw new Error('Deal not found');
    const now = new Date().toISOString();
    const row = [
      id, data.campaign_id || '', data.account_id || '', data.primary_contact_id || '',
      data.title, data.amount, data.stage, data.probability_score,
      data.expected_close_date || '', data.created_at, now
    ];
    await updateRow(`${TAB}!A${idx}:K${idx}`, row);
    return { ...data, updated_at: now };
  }
};