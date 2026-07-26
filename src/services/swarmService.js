export const swarmService = {
  async deploySwarmAgent(agent, context, signal) {
    // Simulate Cloudflare Worker API call with signal support
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        resolve();
      }, 800);

      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }
    });
  }
};
