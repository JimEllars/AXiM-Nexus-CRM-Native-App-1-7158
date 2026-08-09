export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(value.trim());
      if (row.some(cell => cell !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (quoted) {
    throw new Error('CSV contains an unclosed quoted value.');
  }

  row.push(value.trim());
  if (row.some(cell => cell !== '')) rows.push(row);
  return rows;
};

export const normalizeContactType = (value, fallback) => {
  const normalized = String(value || fallback).trim().toUpperCase();

  if (['B2B', 'B2B_LEAD', 'BUSINESS', 'BUSINESS_CONTACT'].includes(normalized)) {
    return 'B2B_LEAD';
  }

  if (['B2C', 'B2C_LEAD', 'B2C_CONSUMER', 'CONSUMER', 'PERSONAL'].includes(normalized)) {
    return 'B2C_LEAD';
  }

  throw new Error(`Unsupported contact type "${value}". Use B2B or B2C.`);
};
