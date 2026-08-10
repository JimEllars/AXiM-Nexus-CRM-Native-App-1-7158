export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const prompt = body.prompt;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const messages = [
      { role: "system", content: "You are a professional B2B/B2C sales assistant. Write a short, engaging email based on the user's prompt. Do not include subject lines, just the body of the email. Keep it concise." },
      { role: "user", content: prompt }
    ];

    const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', { messages });

    return new Response(JSON.stringify({ text: response.response }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('AI Generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
