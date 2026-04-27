const DEFAULT_MODEL = "gemini-3-flash-preview";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function buildPrompt({ mode, question, context }) {
  return [
    "You are the Manager AI Agent for a parts ordering portal.",
    "Use only the provided dashboard context. Do not invent orders, customers, branches, or values.",
    "Write concise, manager-ready output with practical next actions.",
    "If data is insufficient, say what is missing.",
    "",
    `Mode: ${mode || "briefing"}`,
    question ? `Manager question: ${question}` : "Manager question: none",
    "",
    "Dashboard context JSON:",
    JSON.stringify(context || {}, null, 2),
    "",
    "Return a short briefing with: current situation, risks, and recommended actions."
  ].join("\n");
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map(part => part.text || "").join("").trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: "GEMINI_API_KEY is not configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON body" });
    }
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const prompt = buildPrompt(body || {});

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 900
          }
        })
      }
    );

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      return sendJson(res, geminiResponse.status, {
        error: data?.error?.message || "Gemini request failed"
      });
    }

    const answer = extractGeminiText(data);
    return sendJson(res, 200, {
      answer: answer || "Gemini returned an empty response."
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error.message || "Unable to call Gemini"
    });
  }
};
