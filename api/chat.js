const SYSTEM_PROMPT = {
  role: "system",
  content: "You are Farhan AI, a helpful voice-first personal assistant. Be concise and clear. This web preview cannot directly control the user's computer. Never claim you performed an action you did not perform. Ask before consequential actions."
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  try {
    const body = req.body || {};
    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 20) {
      return res.status(400).json({ error: "Send between 1 and 20 chat messages." });
    }
    const messages = body.messages.map((message) => {
      if (!message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string") {
        throw new Error("Invalid message format.");
      }
      return { role: message.role, content: message.content.slice(0, 6000) };
    });
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    if (!openRouterKey && !groqKey) {
      return res.status(503).json({ error: "AI provider isn't configured yet. In Vercel → Project Settings → Environment Variables, add GROQ_API_KEY or OPENROUTER_API_KEY, then redeploy." });
    }
    const endpoint = openRouterKey
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.groq.com/openai/v1/chat/completions";
    const key = openRouterKey || groqKey;
    const model = openRouterKey
      ? (process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini")
      : (process.env.GROQ_MODEL || "llama-3.3-70b-versatile");
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(openRouterKey ? { "HTTP-Referer": "https://farhan-ai.vercel.app", "X-Title": "Farhan AI" } : {})
      },
      body: JSON.stringify({ model, messages: [SYSTEM_PROMPT, ...messages], temperature: 0.6 })
    });
    if (!upstream.ok) {
      const detail = (await upstream.text()).slice(0, 350);
      console.error("AI provider returned", upstream.status, detail);
      return res.status(502).json({ error: "The AI provider rejected the request. Check your provider key, model name, and account credits." });
    }
    const data = await upstream.json();
    return res.status(200).json({ text: data.choices?.[0]?.message?.content || "I couldn't generate a reply." });
  } catch (error) {
    console.error("Farhan AI chat error:", error);
    return res.status(400).json({ error: error.message || "Unable to process this request." });
  }
};
