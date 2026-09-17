export const CONFIG_KEY = "rb-ai-config";

export const getAiConfig = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(CONFIG_KEY));
  } catch {
    return null;
  }
};

export const setAiConfig = (config) => {
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const clearAiConfig = () => {
  window.localStorage.removeItem(CONFIG_KEY);
};

export const isChromeAI = () =>
  typeof window !== "undefined" &&
  typeof window.ai !== "undefined" &&
  Boolean(window.ai && window.ai.languageModel);

export const htmlToText = (html = "") =>
  (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const esc = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const textToParagraphs = (text) =>
  text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${esc(line)}</p>`)
    .join("");

export const textToBullets = (text) => {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 1) return `<p>${esc(lines[0])}</p>`;
  return `<ul>${lines.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>`;
};

export const textToEditorHtml = (text) => {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length <= 1) return lines[0] ? `<p>${esc(lines[0])}</p>` : "";
  const bullets = lines.filter((line) => /^[-*•]\s/.test(line));
  if (bullets.length >= 2) {
    return textToBullets(lines.map((line) => line.replace(/^[-*•]\s*/, "")));
  }
  return textToParagraphs(lines.join("\n"));
};

const chromeGenerate = async (system, user) => {
  const ai = window.ai;
  if (!ai || !ai.languageModel) throw new Error("Chrome built-in AI is not available.");
  const session = await ai.languageModel.create({ systemPrompt: system });
  try {
    return await session.prompt(user);
  } finally {
    if (session && typeof session.destroy === "function") {
      try { await session.destroy(); } catch { /* ignore */ }
    }
  }
};

const openaiGenerate = async (config, system, user) => {
  const baseUrl = (config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status})${detail ? `: ${detail}` : ""}`);
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned an empty response.");
  return content;
};

export const aiGenerate = async ({ system, user }) => {
  const config = getAiConfig();
  if (config && config.provider === "openai" && config.apiKey) {
    return openaiGenerate(config, system, user);
  }
  if (isChromeAI()) return chromeGenerate(system, user);
  throw new Error(
    "No AI provider is configured. Add an API key in settings or enable Chrome built-in AI."
  );
};

export const isAiAvailable = () => {
  const config = getAiConfig();
  return Boolean(isChromeAI() || (config && config.provider === "openai" && config.apiKey));
};