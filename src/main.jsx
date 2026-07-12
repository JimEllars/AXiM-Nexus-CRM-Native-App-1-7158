import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const cloudflareAnalyticsToken = import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN;
const telemetryEndpoint = import.meta.env.VITE_CF_TELEMETRY_ENDPOINT;

if (cloudflareAnalyticsToken) {
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.setAttribute('data-cf-beacon', JSON.stringify({ token: cloudflareAnalyticsToken }));
  document.head.appendChild(script);
}

if (telemetryEndpoint && navigator.sendBeacon) {
  const appStart = performance.now();

  window.addEventListener('load', () => {
    const loadTime = performance.now() - appStart;
    navigator.sendBeacon(telemetryEndpoint, JSON.stringify({ type: 'page_load', duration: loadTime }));
  });

  window.addEventListener('error', (event) => {
    navigator.sendBeacon(telemetryEndpoint, JSON.stringify({
      type: 'error',
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }));
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason ?? 'unknown');
    navigator.sendBeacon(telemetryEndpoint, JSON.stringify({ type: 'unhandled_rejection', reason }));
  });
}

createRoot(document.getElementById('root')).render(
<StrictMode>
    <App />
</StrictMode>
);