// LEGACY: Google Sheets API Ingress
// TODO: Migrate these inputs to route through the Cloudflare Worker Enrichment Bridge in the next sprint.
// DIRECT DATABASE WRITES DISABLED FOR STABILITY.

const SHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const TOKEN_URL = import.meta.env.VITE_GRETA_TOKEN_URL;
const CHAT_ID = import.meta.env.VITE_CHAT_ID;

let cached = { token: null, exp: 0 };

export async function getAccessToken() {
  if (cached.token && Date.now() < cached.exp) return cached.token;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: CHAT_ID }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'token failed');
  cached = { token: json.access_token, exp: Date.now() + (json.expires_in - 60) * 1000 };
  return cached.token;
}

export async function sheetsRequest(path, init = {}) {
  // Disabled
  console.warn("Legacy sheetsRequest disabled.");
  return {};
}

export const getRows = async (range) => {
    console.warn("Legacy getRows disabled.");
    return [];
};

export const appendRow = async (range, values) => {
    console.warn("Legacy appendRow disabled.");
};

export const appendRows = async (range, valuesArray) => {
    console.warn("Legacy appendRows disabled.");
};

export const updateRow = async (range, values) => {
    console.warn("Legacy updateRow disabled.");
};

export async function getSheetMeta(force = false) {
  return {};
}

export async function getSheetIdByTitle(title) {
  return undefined;
}

export async function ensureTab(title, headers) {
  console.warn("Legacy ensureTab disabled.");
}

export async function findRowIndexById(title, id) {
  return -1;
}

export async function deleteRow(title, id) {
  console.warn("Legacy deleteRow disabled.");
}
