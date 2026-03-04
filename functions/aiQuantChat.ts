import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const { messages, context } = await req.json();

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });

    const systemPrompt = `You are an expert quantitative analyst and trader. 
You specialize in ICT (Inner Circle Trader) concepts, standard deviation levels, session analysis, and price action.
Use the following market data context to answer questions precisely:

${context}

Be concise, actionable, and use exact numbers from the data. Highlight key levels and potential setups.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.4,
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return Response.json({ error: err.error?.message || 'OpenAI error' }, { status: 400 });
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return Response.json({ answer });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});