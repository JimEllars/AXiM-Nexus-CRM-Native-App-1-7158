const fs = require('fs');
let code = fs.readFileSync('src/pages/Pipeline.jsx', 'utf8');

const replacement = `  const filteredDeals = useMemo(() => {
    let dealsToFilter = localDeals;
    if (pipelineType === 'b2b') {
      dealsToFilter = dealsToFilter.filter(d => !!d.account_id);
    } else if (pipelineType === 'b2c') {
      dealsToFilter = dealsToFilter.filter(d => !d.account_id);
    }

    if (selectedCampaignId === 'all') return dealsToFilter;
    return dealsToFilter.filter(d => d.campaign_id === selectedCampaignId);
  }, [localDeals, selectedCampaignId, pipelineType]);`;

code = code.replace(/const filteredDeals = useMemo\(\(\) => \{\n    if \(selectedCampaignId === 'all'\) return localDeals;\n    return localDeals\.filter\(d => d\.campaign_id === selectedCampaignId\);\n  \}, \[localDeals, selectedCampaignId\]\);/g, replacement);

fs.writeFileSync('src/pages/Pipeline.jsx', code);
