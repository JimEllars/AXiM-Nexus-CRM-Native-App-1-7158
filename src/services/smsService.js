import { notificationService } from './notificationService';

export const smsService = {
  async sendSms(toPhone, message) {
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_NEXUS_API_SECRET || 'test-secret'}`
        },
        body: JSON.stringify({ to_phone: toPhone, message })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to send SMS');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SMS Service Error:', error);
      throw error;
    }
  }
};
