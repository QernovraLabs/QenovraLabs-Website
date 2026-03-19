function buildReply(message) {
  const text = String(message || '').toLowerCase().trim();

  if (/(hello|hi|hey|namaste)/.test(text)) {
    return 'Hi! Welcome to Qenovra Labs. Ask me about our vision, products, contact, or location.';
  }
  if (/(what.*build|services|product|offer|tool|automation|platform)/.test(text)) {
    return 'We build AI tools, automation systems, intelligent platforms, and developer infrastructure focused on autonomous intelligence.';
  }
  if (/(vision|mission|goal|future)/.test(text)) {
    return 'Our vision is to build autonomous AI systems that can think, create, and operate at scale with minimal human intervention.';
  }
  if (/(contact|email|reach|connect)/.test(text)) {
    return 'You can contact us at hello.qenovra@gmail.com or use the Get in Touch section on this page.';
  }
  if (/(where|location|india|based)/.test(text)) {
    return 'Qenovra Labs is based in India and building products for global users.';
  }
  if (/(price|pricing|cost)/.test(text)) {
    return 'Pricing is project and product specific. Share your requirement via email and our team will get back to you.';
  }
  if (/(thank|thanks)/.test(text)) {
    return 'Happy to help. If you want, I can also tell you the fastest way to get in touch with the team.';
  }

  return 'Great question. I can help with Qenovra Labs vision, products, contact details, and company information.';
}

async function getOpenRouterReply(message) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const siteUrl = process.env.OPENROUTER_SITE_URL || 'https://qenovra-labs.vercel.app';
  const siteName = process.env.OPENROUTER_SITE_NAME || 'Qenovra Labs Website';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl,
      'X-Title': siteName
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a concise, helpful assistant for Qenovra Labs website visitors. Answer only website/company related queries. If unknown, suggest contacting hello.qenovra@gmail.com.'
        },
        {
          role: 'user',
          content: String(message)
        }
      ],
      temperature: 0.4,
      max_tokens: 220
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with status ${response.status}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply || !String(reply).trim()) {
    throw new Error('OpenRouter returned an empty reply');
  }

  return String(reply).trim();
}

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Use POST /api/chat'
    });
  }

  let payload = req.body || {};
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid JSON body'
      });
    }
  }

  const message = payload.message;
  if (!message || !String(message).trim()) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'message is required'
    });
  }

  const normalizedMessage = String(message).trim();
  if (normalizedMessage.length > 1000) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'message must be 1000 characters or fewer'
    });
  }

  return (async () => {
    try {
      const aiReply = await getOpenRouterReply(normalizedMessage);
      if (aiReply) {
        return res.status(200).json({ reply: aiReply, source: 'openrouter' });
      }
    } catch (error) {
      // Fall back to deterministic local replies if OpenRouter fails.
    }

    return res.status(200).json({
      reply: buildReply(normalizedMessage),
      source: 'local'
    });
  })();
};
