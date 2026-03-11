type MinimaxRequest = {
  prompt: string;
  systemPrompt: string;
};

const DEFAULT_BASE_URL = "https://api.minimax.io/v1";
const DEFAULT_MODEL = "MiniMax-M2.5";
const DEFAULT_API_PATH = "/chat/completions";

export async function generateTextWithMinimax({
  prompt,
  systemPrompt,
}: MinimaxRequest) {
  const apiKey = process.env.MINIMAX_API_KEY ?? process.env.OPENAI_API_KEY;
  const baseUrl = process.env.MINIMAX_BASE_URL ?? DEFAULT_BASE_URL;
  const apiPath = process.env.MINIMAX_API_PATH ?? DEFAULT_API_PATH;
  const model = process.env.MINIMAX_MODEL ?? DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("缺少 MINIMAX_API_KEY 或 OPENAI_API_KEY 环境变量。");
  }

  const normalizedApiPath = normalizeApiPath(apiPath);
  const endpoint = buildEndpoint(baseUrl, normalizedApiPath);
  const isChatCompletions = normalizedApiPath === "chat/completions";
  const body = isChatCompletions
    ? {
        model,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }
    : {
        model,
        temperature: 0.7,
        max_tokens: 600,
        prompt: `${systemPrompt}\n\n${prompt}`,
      };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await safeReadError(response);
    throw new Error(`MiniMax 调用失败：${response.status} ${detail}`);
  }

  const payload = await response.json();
  const text = isChatCompletions
    ? payload?.choices?.[0]?.message?.content
    : payload?.choices?.[0]?.text;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("MiniMax 返回内容为空。");
  }

  return text;
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeApiPath(value: string) {
  return value.replace(/^\/+/, "");
}

function buildEndpoint(baseUrl: string, apiPath: string) {
  return new URL(apiPath, ensureTrailingSlash(baseUrl)).toString();
}

async function safeReadError(response: Response) {
  try {
    const payload = await response.json();
    return payload?.error?.message ?? payload?.message ?? JSON.stringify(payload);
  } catch {
    return response.statusText;
  }
}
