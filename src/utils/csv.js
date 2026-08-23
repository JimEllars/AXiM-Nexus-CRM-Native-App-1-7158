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

export const exportToCsv = (dataArray, filename = 'export.csv') => {
  if (!dataArray || !dataArray.length) {
    return;
  }

  // Flatten nested objects and format timestamps
  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + '_' : '';
      if (
        typeof obj[k] === 'object' &&
        obj[k] !== null &&
        !Array.isArray(obj[k]) &&
        !(obj[k] instanceof Date)
      ) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        let val = obj[k];
        if (val === null || val === undefined) {
          val = '';
        } else if (val instanceof Date) {
          val = val.toLocaleDateString();
        } else if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          // Attempt to format ISO timestamps
          try {
            val = new Date(val).toLocaleString();
          } catch (e) {
            // Keep original if parsing fails
          }
        }
        acc[pre + k] = val;
      }
      return acc;
    }, {});
  };

  const processedData = dataArray.map(item => flattenObject(item));

  // Extract all unique headers across all rows to handle inconsistent objects
  const headers = Array.from(new Set(processedData.flatMap(Object.keys)));

  const csvRows = [];

  // Headers row
  csvRows.push(headers.map(header => `"${String(header).replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of processedData) {
    const values = headers.map(header => {
      const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
      const stringVal = String(val);
      // Escape double quotes and enclose in double quotes
      return `"${stringVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
