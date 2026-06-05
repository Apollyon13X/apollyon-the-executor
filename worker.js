export default {
  async fetch(request, env) {
    // 1. Handle CORS Preflight (Required for browsers calling the API)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 2. Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: { 'Access-Control-Allow-Origin': '*' } 
      });
    }

    try {
      // 3. Parse the incoming command from the user
      const { command } = await request.json();

      if (!command) {
        return new Response(JSON.stringify({ output: "Error: No command provided.", type: "error" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // 4. Call Ollama Cloud API
      const ollamaUrl = 'https://api.ollama.com/v1/chat/completions';
      
      const ollamaResponse = await fetch(ollamaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OLLAMA_API_KEY}`, // Uses the secret we set earlier
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'n30-777/ghostreaper', // Your custom model name
          messages: [
            { role: 'system', content: 'You are Apollyon_The_Executor. Be brutal, concise, and helpful.' },
            { role: 'user', content: command }
          ],
          stream: false // We need the full response instantly
        }),
      });

      if (!ollamaResponse.ok) {
        const errorText = await ollamaResponse.text();
        throw new Error(`Ollama Error: ${ollamaResponse.status} - ${errorText}`);
      }

      const ollamaData = await ollamaResponse.json();
      const aiResponse = ollamaData.choices[0].message.content;

      // 5. Return the result to the frontend
      return new Response(JSON.stringify({
        output: aiResponse,
        type: 'success'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Allow GitHub Pages to read this
        }
      });

    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({
        output: `System Failure: ${error.message}`,
        type: 'error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
