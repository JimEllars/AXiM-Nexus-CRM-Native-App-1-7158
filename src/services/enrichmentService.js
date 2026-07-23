import { toast } from 'react-toastify';

let requestTimestamps = [];

export const enrichmentService = {
  getQueue() {
    return JSON.parse(localStorage.getItem('enrichment_queue') || '[]');
  },

  addToQueue(record) {
    const queue = this.getQueue();
    queue.unshift({ ...record, timestamp: Date.now() });
    if (queue.length > 5) queue.pop();
    localStorage.setItem('enrichment_queue', JSON.stringify(queue));

    // dispatch custom event to update dashboard
    window.dispatchEvent(new Event('enrichment_queue_updated'));
  },

  async triggerDataEnrichment(entityId, entityType) {
    const now = Date.now();
    requestTimestamps = requestTimestamps.filter(t => now - t < 10000);

    if (requestTimestamps.length >= 5) {
      toast.warn('Rate Limit Exceeded: Scraper bridge cooling down');

      // Log to DLQ telemetry
      try {
        const queue = JSON.parse(localStorage.getItem('axim_dlq_queue') || '[]');
        queue.push({ type: 'RATE_LIMIT_EXCEEDED', timestamp: new Date().toISOString(), entityId, entityType, message: 'Scraper bridge cooling down' });
        localStorage.setItem('axim_dlq_queue', JSON.stringify(queue));
      } catch (e) {
        console.error('Failed to log to DLQ', e);
      }

      throw new Error('Rate Limit Exceeded: Scraper bridge cooling down');
    }

    requestTimestamps.push(now);

    this.addToQueue({ entityId, entityType, status: 'Scraping...' });

    const bridgeUrl = import.meta.env.VITE_ENRICHMENT_BRIDGE_URL;

    if (!bridgeUrl) {
      console.warn("VITE_ENRICHMENT_BRIDGE_URL is not defined.");
      toast.error('Enrichment Bridge URL is not configured.');
      this.addToQueue({ entityId, entityType, status: 'Failed' });
      throw new Error('Bridge URL is not configured');
    }

    try {
      const startTime = performance.now();
      const response = await fetch(bridgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityId,
          entityType
        }),
      });

      const endTime = performance.now();
      const latency = endTime - startTime;

      if (latency > 3000) {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/cdn-cgi/telemetry', JSON.stringify({
            type: 'LATENCY_WARNING',
            service: 'enrichmentService',
            latency: latency,
            timestamp: new Date().toISOString()
          }));
        }
      }

      if (!response.ok) {
        this.addToQueue({ entityId, entityType, status: 'Failed' });
        throw new Error(`Bridge responded with status: ${response.status}`);
      }

      const data = await response.json();
      this.addToQueue({ entityId, entityType, status: 'Enriched' });
      return data;
    } catch (error) {
      console.error('Enrichment bridge error:', error);
      toast.error('Enrichment Bridge unreachable.');
      this.addToQueue({ entityId, entityType, status: 'Failed' });
      throw error;
    }
  }
};
