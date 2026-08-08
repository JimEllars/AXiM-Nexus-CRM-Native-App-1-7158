export const findDuplicates = (contacts) => {
  if (!contacts || contacts.length === 0) return [];

  const duplicates = [];
  const emailMap = new Map();
  const nameMap = new Map();

  contacts.forEach(contact => {
    if (contact.email) {
      const email = contact.email.toLowerCase();
      if (emailMap.has(email)) {
        emailMap.get(email).push(contact);
      } else {
        emailMap.set(email, [contact]);
      }
    }

    if (contact.first_name && contact.last_name) {
      const nameKey = `${contact.first_name.toLowerCase()}|${contact.last_name.toLowerCase()}`;
      if (nameMap.has(nameKey)) {
        nameMap.get(nameKey).push(contact);
      } else {
        nameMap.set(nameKey, [contact]);
      }
    }
  });

  const duplicateGroups = [];

  emailMap.forEach(group => {
    if (group.length > 1) duplicateGroups.push(group);
  });

  nameMap.forEach(group => {
    if (group.length > 1) {
      const isSubset = duplicateGroups.some(existingGroup => {
        return group.every(c => existingGroup.find(ec => ec.id === c.id));
      });
      if (!isSubset) duplicateGroups.push(group);
    }
  });

  return duplicateGroups;
};
