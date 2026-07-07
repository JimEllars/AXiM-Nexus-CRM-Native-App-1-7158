import { toast } from 'react-toastify';

export const enrichmentService = {
  async triggerDataEnrichment(entityId, entityType) {
    const bridgeUrl = import.meta.env.VITE_ENRICHMENT_BRIDGE_URL;

    if (!bridgeUrl) {
      console.warn("VITE_ENRICHMENT_BRIDGE_URL is not defined.");
      toast.error('Enrichment Bridge URL is not configured.');
      throw new Error('Bridge URL is not configured');
    }

    try {
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

      if (!response.ok) {
        throw new Error(`Bridge responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Enrichment bridge error:', error);
      toast.error('Enrichment Bridge unreachable.');
      throw error;
    }
  }
};
