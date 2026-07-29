export const emailService = {
  async sendTransactionalEmail(customerId, subject, body) {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
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
