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

export const isChromeAI = () => {
  if (typeof window === "undefined") return false;
  return Boolean(
    typeof window.LanguageModel !== "undefined" ||
    (typeof window.ai !== "undefined" && window.ai?.languageModel),
  );
};

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

/** Redact direct contact PII (email, phone, zip) before sending text to external AI providers */
export const sanitizeForAi = (text = "") => {
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email]")
    .replace(
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      "[phone]",
    )
    .replace(/\b\d{5,6}\b/g, "[zipcode]");
};

const chromeGenerate = async (system, user) => {
  if (typeof window === "undefined")
    throw new Error("Chrome built-in AI is not available.");
  const lm = window.LanguageModel || window.ai?.languageModel;
  if (!lm) throw new Error("Chrome built-in AI is not available.");

  if (typeof lm.availability === "function") {
    try {
      const status = await lm.availability();
      if (status === "no") {
        throw new Error("Chrome built-in AI is not supported on this device.");
      }
    } catch (e) {
      if (e.message && e.message.includes("not supported")) throw e;
    }
  }

  const timeoutMs = 30000;
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Chrome AI request timed out after 30 seconds.")),
      timeoutMs,
    ),
  );

  const generatePromise = (async () => {
    let session;
    try {
      if (system) {
        try {
          session = await lm.create({
            initialPrompts: [{ role: "system", content: system }],
          });
        } catch {
          session = await lm.create({ systemPrompt: system });
        }
      } else {
        session = await lm.create();
      }
      return await session.prompt(user);
    } finally {
      if (session && typeof session.destroy === "function") {
        try {
          await session.destroy();
        } catch {
          /* ignore */
        }
      }
    }
  })();

  return Promise.race([generatePromise, timeoutPromise]);
};

const openaiGenerate = async (config, system, user) => {
  const baseUrl = URL.canParse(config.baseUrl)
    ? config.baseUrl
    : "https://api.openai.com/v1";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model || "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (res.status === 401) {
      throw new Error("Invalid API key. Please check your key in AI settings.");
    }
    if (res.status === 429) {
      throw new Error("API rate limit exceeded. Please try again later.");
    }
    if (!res.ok) {
      throw new Error(
        `AI provider error (${res.status}). Please check your settings.`,
      );
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned an empty response.");
    return content;
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("AI request timed out after 30 seconds.");
    }
    if (
      e instanceof TypeError ||
      (e.message && e.message.includes("Failed to fetch"))
    ) {
      throw new Error(
        "Couldn't reach the AI provider. Please check your API key, base URL, and internet connection.",
      );
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const aiGenerate = async ({ system, user }) => {
  const config = getAiConfig();
  if (config && config.provider === "openai" && config.apiKey) {
    return openaiGenerate(config, system, user);
  }
  if (isChromeAI()) return chromeGenerate(system, user);
  throw new Error(
    "No AI provider is configured. Add an API key in settings or enable Chrome built-in AI.",
  );
};

export const isAiAvailable = () => {
  const config = getAiConfig();
  return Boolean(
    isChromeAI() || (config && config.provider === "openai" && config.apiKey),
  );
};
