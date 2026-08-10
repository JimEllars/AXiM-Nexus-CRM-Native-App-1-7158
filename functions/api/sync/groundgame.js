export async function onRequestPost() {
  return new Response(JSON.stringify({
    error: 'Ground Game outbound sync is not configured.'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
}
