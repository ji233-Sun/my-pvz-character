import catalogJson from "@/data/pvz-catalog.json";

export type FortuneMode = "random" | "plant" | "zombie";
export type CharacterType = Exclude<FortuneMode, "random">;

type PlantStats = {
  durability: number;
  planting: number;
  attack: number;
  range: number;
  support: number;
  control: number;
};

type ZombieStats = {
  strength: number;
  speed: number;
};

export type PlantEntry = {
  id: string;
  name: string;
  avatar: string;
  rarity: string;
  classification: string;
  attributes: string[];
  stats: PlantStats;
};

export type ZombieEntry = {
  id: string;
  name: string;
  avatar: string;
  classification: string;
  attributes: string[];
  rarity: number;
  stats: ZombieStats;
};

type PvzCatalog = {
  fetchedAt: string;
  sources: Record<string, string>;
  plants: PlantEntry[];
  zombies: ZombieEntry[];
};

export type CharacterEntry = PlantEntry | ZombieEntry;

const catalog = catalogJson as PvzCatalog;

export const sourceRequestPaths = {
  plants: "/book/all?book_type=10",
  zombies: "/book/all?book_type=11",
};

const promptCatalog = {
  plant: catalog.plants
    .map(
      (item) =>
        `${item.name} | 职能:${item.classification} | 稀有度:${item.rarity} | 属性:${formatAttributeText(item.attributes)} | 面板:生命${item.stats.durability}/种植${item.stats.planting}/攻击${item.stats.attack}/射程${item.stats.range}/辅助${item.stats.support}/控制${item.stats.control}`,
    )
    .join("\n"),
  zombie: catalog.zombies
    .map(
      (item) =>
        `${item.name} | 阵营:${item.classification} | 标签:${formatAttributeText(item.attributes)} | 面板:强度${item.stats.strength}/速度${item.stats.speed}`,
    )
    .join("\n"),
};

export function getCatalogStats() {
  return {
    plantCount: catalog.plants.length,
    zombieCount: catalog.zombies.length,
    fetchedAt: catalog.fetchedAt,
  };
}

export function resolveCharacterType(mode: FortuneMode): CharacterType {
  if (mode === "random") {
    return Math.random() > 0.5 ? "plant" : "zombie";
  }

  return mode;
}

export function getCandidates(type: CharacterType) {
  return type === "plant" ? catalog.plants : catalog.zombies;
}

export function getPromptCatalog(type: CharacterType) {
  return promptCatalog[type];
}

export function findCandidateByName(type: CharacterType, name: string) {
  const normalized = normalizeName(name);

  return getCandidates(type).find((item) => normalizeName(item.name) === normalized) ?? null;
}

export function formatPublicProfile(type: CharacterType, item: CharacterEntry) {
  if (type === "plant") {
    const plant = item as PlantEntry;

    return {
      avatar: plant.avatar,
      classification: plant.classification,
      rarity: plant.rarity,
      attributes: plant.attributes,
      panel: [
        `生命 ${plant.stats.durability}`,
        `种植 ${plant.stats.planting}`,
        `攻击 ${plant.stats.attack}`,
        `射程 ${plant.stats.range}`,
        `辅助 ${plant.stats.support}`,
        `控制 ${plant.stats.control}`,
      ],
    };
  }

  const zombie = item as ZombieEntry;

  return {
    avatar: zombie.avatar,
    classification: zombie.classification,
    rarity: "图鉴角色",
    attributes: zombie.attributes,
    panel: [`强度 ${zombie.stats.strength}`, `速度 ${zombie.stats.speed}`],
  };
}

function normalizeName(value: string) {
  return value.replace(/\s+/g, "").trim();
}

function formatAttributeText(attributes: string[]) {
  return attributes.length > 0 ? attributes.join("、") : "无";
}
