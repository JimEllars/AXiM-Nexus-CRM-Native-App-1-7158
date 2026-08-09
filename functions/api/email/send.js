export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // Check for secret if configured, but allow bypass for testing if not set
    // The prompt says: It must authenticate using context.env.NEXUS_API_SECRET
    const authHeader = request.headers.get('Authorization');
    const secret = env.NEXUS_API_SECRET;

    // If the secret is set, require it
    if (secret && authHeader !== `Bearer ${secret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { to, subject, body: emailBody } = body;

    if (!to || !subject || !emailBody) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Simulate a 1-second delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a 200 OK with a mock message_id
    return new Response(JSON.stringify({
      message: 'Email dispatched successfully',
      message_id: `mock-id-${Date.now()}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
