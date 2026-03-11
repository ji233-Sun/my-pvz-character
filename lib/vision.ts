type VisionRequest = {
  imageUrl: string;
  systemPrompt: string;
  userPrompt: string;
};

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_API_PATH = "/chat/completions";

export async function generateTextWithVision({
  imageUrl,
  systemPrompt,
  userPrompt,
}: VisionRequest): Promise<string> {
  const apiKey = process.env.VISION_API_KEY;
  const baseUrl = process.env.VISION_BASE_URL ?? DEFAULT_BASE_URL;
  const apiPath = process.env.VISION_API_PATH ?? DEFAULT_API_PATH;
  const model = process.env.VISION_MODEL ?? DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("缺少 VISION_API_KEY 环境变量。");
  }

  const normalizedApiPath = normalizeApiPath(apiPath);
  const endpoint = buildEndpoint(baseUrl, normalizedApiPath);
  const body = {
    model,
    temperature: 0.7,
    max_tokens: 800,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: userPrompt },
        ],
      },
    ],
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
    throw new Error(`Vision API 调用失败：${response.status} ${detail}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Vision API 返回内容为空。");
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
