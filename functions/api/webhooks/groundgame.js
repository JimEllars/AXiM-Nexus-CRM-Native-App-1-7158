export async function onRequestPost(context) {
  return new Response(JSON.stringify({
    error: 'This legacy endpoint is retired. Use /api/webhooks/inbound.'
  }), {
    status: 410,
    headers: { 'Content-Type': 'application/json' }
  });
}
