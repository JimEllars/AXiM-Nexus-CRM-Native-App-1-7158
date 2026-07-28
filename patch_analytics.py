import re

with open('src/pages/Analytics.jsx', 'r') as f:
    content = f.read()

# Replace mockSwarmTasks and use useCrm activities to calculate
new_code = """
  const { loading, deals, activities } = useCrm();

  const swarmTasksData = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    // Filter for SWARM_COMPLETE
    const swarmActivities = activities.filter(a => a.type === 'SWARM_COMPLETE' || a.activity_type === 'SWARM_COMPLETE');

    // Group by day using created_at
    const grouped = swarmActivities.reduce((acc, activity) => {
      const date = new Date(activity.created_at);
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      acc[dayStr] = (acc[dayStr] || 0) + 1;
      return acc;
    }, {});

    // We want the last 7 days in order ideally, but for now we'll just sort or return what we have.
    // Let's create a template for the last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      result.push({ name: dayStr, tasks: grouped[dayStr] || 0 });
    }

    return result;
  }, [activities]);
"""

content = content.replace("const { loading, deals } = useCrm();", new_code)
content = content.replace("data={mockSwarmTasks}", "data={swarmTasksData}")

with open('src/pages/Analytics.jsx', 'w') as f:
    f.write(content)
