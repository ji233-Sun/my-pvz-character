import {
  type CharacterType,
  type FortuneMode,
  findCandidateByName,
  formatPublicProfile as formatCandidateProfile,
  getPromptCatalog,
  resolveCharacterType,
} from "@/lib/pvz-data";
import { generateTextWithMinimax } from "@/lib/minimax";

export type FortuneResult = {
  mode: FortuneMode;
  characterType: CharacterType;
  nickname: string;
  name: string;
  reason: string;
  summary: string;
  vibeTags: string[];
  avatar: string;
  classification: string;
  rarity: string;
  attributes: string[];
  panel: string[];
};

type GenerateFortuneInput = {
  nickname: string;
  mode: FortuneMode;
};

const typeLabelMap: Record<CharacterType, string> = {
  plant: "植物",
  zombie: "僵尸",
};

const systemPrompt = [
  "你是植物大战僵尸2图鉴人格分析师。",
  "你要根据用户昵称，从候选列表中选出唯一一个最贴切的角色。",
  "判断允许带一点幽默，但理由必须自洽，不能空泛。",
  "只能从候选列表里选，不能自创角色。",
  "最终只能输出 JSON，不要输出 Markdown，不要输出代码块，不要输出额外说明。",
  'JSON 结构必须是 {"name":"角色名","summary":"一句短评","reason":"2到4句理由","vibeTags":["标签1","标签2","标签3"]}。',
  "严禁在任何字段的字符串内容中使用英文双引号（\"），如需引用请改用中文书名号「」或『』。",
].join("");

export async function generateFortuneResult({
  nickname,
  mode,
}: GenerateFortuneInput): Promise<FortuneResult> {
  const normalizedNickname = nickname.trim();
  const characterType = resolveCharacterType(mode);
  const prompt = buildPrompt(normalizedNickname, characterType);
  const modelText = await generateTextWithMinimax({
    prompt,
    systemPrompt,
  });
  const parsed = parseModelResponse(modelText);
  const matchedCharacter = findCharacter(characterType, parsed.name);

  return {
    mode,
    characterType,
    nickname: normalizedNickname,
    name: matchedCharacter.name,
    reason: parsed.reason,
    summary: parsed.summary,
    vibeTags: parsed.vibeTags,
    ...formatCandidateProfile(characterType, matchedCharacter),
  };
}

function buildPrompt(nickname: string, characterType: CharacterType) {
  return [
    `用户昵称：${nickname}`,
    `目标阵营：${typeLabelMap[characterType]}`,
    "请重点参考昵称的音感、字面意象、情绪气质、节奏感、反差感和角色联想。",
    "不要声称你掌握了用户真实信息，也不要胡编背景故事。",
    "输出中的 name 必须和候选列表完全一致。",
    "候选列表如下：",
    getPromptCatalog(characterType),
  ].join("\n");
}

function parseModelResponse(rawText: string) {
  const cleanedText = rawText
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  const jsonText = extractJson(cleanedText);
  const payload = JSON.parse(jsonText) as {
    name?: string;
    summary?: string;
    reason?: string;
    vibeTags?: unknown;
  };

  if (!payload.name || !payload.summary || !payload.reason) {
    throw new Error("模型返回的 JSON 字段不完整。");
  }

  return {
    name: payload.name.trim(),
    summary: payload.summary.trim(),
    reason: payload.reason.trim(),
    vibeTags: sanitizeTags(payload.vibeTags),
  };
}

function findCharacter(characterType: CharacterType, name: string) {
  const matchedCharacter = findCandidateByName(characterType, name);

  if (!matchedCharacter) {
    throw new Error("模型返回了不在图鉴里的角色名。");
  }

  return matchedCharacter;
}

function extractJson(text: string) {
  try {
    JSON.parse(text);
    return text;
  } catch {
    const matched = text.match(/\{[\s\S]*\}/);

    if (!matched) {
      throw new Error("未找到可解析的 JSON。");
    }

    return matched[0];
  }
}

function sanitizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return ["图鉴气质", "昵称联想", "本命雷达"];
  }

  const tags = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return tags.length > 0 ? tags : ["图鉴气质", "昵称联想", "本命雷达"];
}
