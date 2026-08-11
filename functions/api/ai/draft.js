export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { contactName, company, promptContext } = body;

    if (!promptContext) {
      return new Response(JSON.stringify({ error: 'Prompt context is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const toneInstruction = company
      ? "Adopt a formal, professional B2B sales tone."
      : "Adopt a friendly, community-oriented B2C tone.";

    const messages = [
      { role: "system", content: `You are an expert AXiM sales representative drafting a concise email. ${toneInstruction} Do not include conversational filler like "Here is your draft:". Do not include subject lines, just the body of the email. Respond strictly with the email text only.` },
      { role: "user", content: `Write an email to ${contactName ? contactName : 'a contact'}${company ? ` at ${company}` : ''} about: ${promptContext}` }
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
