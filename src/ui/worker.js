export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const { command } = await request.json();

    // Call Ollama Cloud API
    const ollamaResponse = await fetch('https://api.ollama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OLLAMA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'n30-777/ghostreaper', // Your custom model
        messages: [{ role: 'user', content: command }]
      })
    });

    const data = await ollamaResponse.json();
    
    // Optional: Push to IPFS for permanence
    // const ipfsHash = await pushToIPFS(data.choices[0].message.content);

    return new Response(JSON.stringify({
      output: data.choices[0].message.content,
      type: 'success'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
