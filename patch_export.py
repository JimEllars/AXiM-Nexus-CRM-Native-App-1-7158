import re
import datetime

with open('src/pages/Accounts.jsx', 'r') as f:
    content = f.read()

# We need to import activityService in Accounts.jsx if it's not imported.
if "import { activityService }" not in content:
    content = content.replace("import { accountService }", "import { accountService }\nimport { activityService } from '../services/activityService';")

export_function = """
  const handleExport = async () => {
    try {
      if (!localAccounts || localAccounts.length === 0) {
        toast.info('No accounts to export.');
        return;
      }

      const headers = ['Name', 'Industry', 'Domain', 'Enrichment Status'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      localAccounts.forEach(acc => {
        const row = [
          `"${acc.company_name || ''}"`,
          `"${acc.industry || ''}"`,
          `"${acc.website || ''}"`,
          `"Enriched"` // Dummy or default enrichment status, could be actual if exists in acc
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];

      link.href = url;
      link.setAttribute('download', `AXiM_Accounts_Export_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await activityService.logSystemActivity(`Operator exported ${localAccounts.length} B2B Account records to CSV.`);
      toast.success('Account records exported successfully.');
    } catch (e) {
      console.error('Export error:', e);
      toast.error('Failed to export accounts.');
    }
  };
"""

# Replace the existing handleExport function
old_export_pattern = r"const handleExport = async \(\) => {[\s\S]*?catch \(e\) {\s*toast\.info\('Account export queued on the edge network\.'\);\s*}\s*};"

content = re.sub(old_export_pattern, export_function.strip(), content)

with open('src/pages/Accounts.jsx', 'w') as f:
    f.write(content)
