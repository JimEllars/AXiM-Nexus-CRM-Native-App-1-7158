export const mockCampaigns = [
  { id: 'camp-1', name: 'Q3 Commercial Solar Push', type: 'B2B', budget: 50000, status: 'ACTIVE' },
  { id: 'camp-2', name: 'UniFirst Fleet Outreach', type: 'B2B', budget: 25000, status: 'ACTIVE' },
  { id: 'camp-3', name: 'Residential Solar Summer', type: 'B2C', budget: 15000, status: 'PAUSED' },
];

export const mockAccounts = [
  { id: 'acc-1', company_name: 'UniFirst Corporation', industry: 'Uniforms & Facility Services', website: 'unifirst.com', employee_count: 14000 },
  { id: 'acc-2', company_name: 'Apex Commercial Solar', industry: 'Renewable Energy', website: 'apexsolar-commercial.com', employee_count: 250 },
  { id: 'acc-3', company_name: 'Nexus Logistics', industry: 'Supply Chain', website: 'nexuslogistics.net', employee_count: 1200 },
];

export const mockContacts = [
  { id: 'con-1', account_id: 'acc-1', first_name: 'Sarah', last_name: 'Jenkins', email: 's.jenkins@unifirst.com', phone: '+18005550199', type: 'B2B_LEAD' },
  { id: 'con-2', account_id: 'acc-2', first_name: 'Marcus', last_name: 'Chen', email: 'mchen@apexsolar-commercial.com', phone: '+18005550244', type: 'B2B_LEAD' },
  { id: 'con-3', account_id: null, first_name: 'Elena', last_name: 'Rodriguez', email: 'elena.r.88@gmail.com', phone: '+18005550381', type: 'B2C_CONSUMER' },
  { id: 'con-4', account_id: 'acc-3', first_name: 'David', last_name: 'Oppenheimer', email: 'doppenheimer@nexuslogistics.net', phone: '+18005550412', type: 'B2B_LEAD' },
];

export const mockDeals = [
  { id: 'deal-1', campaign_id: 'camp-2', account_id: 'acc-1', primary_contact_id: 'con-1', assigned_agent_id: 'agent-x', title: 'UniFirst Q3 Fleet Expansion', amount: 125000, stage: 'PROPOSAL', probability_score: 82, expected_close_date: '2026-09-15' },
  { id: 'deal-2', campaign_id: 'camp-1', account_id: 'acc-2', primary_contact_id: 'con-2', assigned_agent_id: 'agent-x', title: 'Apex Commercial Array Phase 1', amount: 450000, stage: 'NEGOTIATION', probability_score: 65, expected_close_date: '2026-08-30' },
  { id: 'deal-3', campaign_id: 'camp-3', account_id: null, primary_contact_id: 'con-3', assigned_agent_id: 'agent-y', title: 'Residential Solar Install - 8kW', amount: 24000, stage: 'QUALIFIED', probability_score: 45, expected_close_date: '2026-08-10' },
  { id: 'deal-4', campaign_id: 'camp-1', account_id: 'acc-3', primary_contact_id: 'con-4', assigned_agent_id: 'agent-x', title: 'Nexus Supply Chain Audit', amount: 85000, stage: 'PROSPECT', probability_score: 15, expected_close_date: '2026-10-01' },
];

export const mockActivities = [
  { id: 'act-1', contact_id: 'con-1', deal_id: 'deal-1', type: 'SCRAPE_EVENT', description: 'Lead enriched via Omni-Channel Bridge. E.164 phone hash verified.', logged_by_agent_id: null, created_at: '2026-07-18T10:00:00Z', metadata: {source: 'LinkedIn Sales Navigator'} },
  { id: 'act-2', contact_id: 'con-1', deal_id: 'deal-1', type: 'ONYX_INTERVENTION', description: 'Onyx Mk3 generated personalized cold outreach sequence based on firmographic data.', logged_by_agent_id: null, created_at: '2026-07-18T10:05:00Z', metadata: {sequence_id: 'seq-992'} },
  { id: 'act-3', contact_id: 'con-1', deal_id: 'deal-1', type: 'EMAIL', description: 'Sent Sequence Email 1: "Optimizing your Q3 Fleet Logistics"', logged_by_agent_id: null, created_at: '2026-07-19T08:00:00Z', metadata: {} },
];