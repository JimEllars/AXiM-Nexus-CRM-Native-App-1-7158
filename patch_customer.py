with open('src/pages/Customer360.jsx', 'r') as f:
    content = f.read()

recent_interactions = """
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center space-x-2">
              <SafeIcon icon={FiIcons.FiActivity} className="text-indigo-500" />
              <span>Recent Interactions</span>
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-slate-100 pl-8">
              {contactActivities.slice(0, 5).map((activity) => {
                const type = activity.activity_type || activity.type || 'SYSTEM_EVENT';
                const notes = typeof activity.notes === 'string' ? JSON.parse(activity.notes) : (activity.notes || {});
                const description = notes.description || activity.description || '';

                return (
                <div key={activity.id} className="relative group">
                  <div className="absolute -left-8 top-1">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mb-1">{type.replace('_', ' ')}</div>
                  <div className="text-[10px] text-slate-400 mb-2 font-mono">{new Date(activity.created_at).toLocaleString()}</div>
                  <p className="text-xs text-slate-600 leading-relaxed truncate">{description}</p>
                </div>
              )})}
              {contactActivities.length === 0 && <p className="text-xs text-slate-500 italic py-2">No recent interactions.</p>}
            </div>
          </div>
"""

# Insert it right below EnrichmentStatusPanel
find_str = '<EnrichmentStatusPanel entityId={id} entityType="contact" />'
content = content.replace(find_str, find_str + "\n" + recent_interactions)

with open('src/pages/Customer360.jsx', 'w') as f:
    f.write(content)
