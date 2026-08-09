export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const apiKey = context.env.GROUNDGAME_API_KEY || 'test-key';

    // Mock forwarding to Ground Game webhook
    const mockWebhookUrl = 'https://httpbin.org/post'; // Just a mock endpoint for testing

    const response = await fetch(mockWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to sync to Ground Game');
    }

    return new Response(JSON.stringify({ success: true, message: 'Synced to Ground Game successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
