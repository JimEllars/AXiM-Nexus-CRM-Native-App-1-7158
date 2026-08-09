export const emailService = {
  async sendTransactionalEmail(to, subject, body) {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In a real app we'd pass the authorization header here if available from context
        'Authorization': `Bearer ${import.meta.env.VITE_NEXUS_API_SECRET || 'dev-secret'}`
      },
      body: JSON.stringify({
        to,
        subject,
        body,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email dispatch failed with status: ${response.status}`);
    }

    return response.json();
  }
};
