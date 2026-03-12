import express from "express";

const router = express.Router();

// Chat history per session (in-memory, resets on server restart)
const chatSessions = new Map();

// System prompt for the HealthLedger assistant
const SYSTEM_PROMPT = `You are HealthLedger AI Assistant — a helpful, friendly personal assistant for the HealthLedger Smart Healthcare platform. 

Your role:
- Help users navigate the platform (patient dashboard, health cards, medical history, prescriptions, doctor pages, admin panel)
- Answer health-related questions in a general, informative way (always recommend consulting a doctor for specific medical advice)
- Explain features: QR Health Cards, Disease Surveillance, Medical Records, Prescriptions, AI Heatmap
- Guide new users through registration and login
- Help doctors manage patients and prescriptions
- Help admins understand disease monitoring dashboards and reports

Rules:
- Keep responses concise (2-3 sentences max unless asked for detail)
- Be warm and professional
- Never diagnose or prescribe — always recommend seeing a healthcare professional
- Use simple language, avoid medical jargon unless asked
- If asked about something unrelated to healthcare/the platform, politely redirect`;

// POST /api/chat — public endpoint
router.post("/", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return res.json({
        reply: "I'm sorry, the AI service is currently unavailable. Please try again later.",
      });
    }

    // Get or create chat history
    const sid = sessionId || "default";
    if (!chatSessions.has(sid)) {
      chatSessions.set(sid, []);
    }
    const history = chatSessions.get(sid);

    // Add user message
    history.push({ role: "user", content: message });

    // Keep only last 10 messages to save tokens
    const recentHistory = history.slice(-10);

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...recentHistory,
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content?.trim() || "I'm sorry, I couldn't process that. Please try again.";

    // Add assistant reply to history
    history.push({ role: "assistant", content: reply });

    // Cap history at 20 messages
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.json({
      reply: "I'm experiencing a temporary issue. Please try again in a moment.",
    });
  }
});

export default router;
