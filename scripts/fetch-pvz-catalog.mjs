import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const requestUrls = {
  plants: "https://pvz2.hrgame.com.cn/book/all?book_type=10",
  plantFilters: "https://pvz2.hrgame.com.cn/book/filter?book_type=10",
  zombies: "https://pvz2.hrgame.com.cn/book/all?book_type=11",
  zombieFilters: "https://pvz2.hrgame.com.cn/book/filter?book_type=11",
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "data");
const outputFile = path.join(outputDir, "pvz-catalog.json");

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function toNameMap(items = []) {
  return new Map(items.map((item) => [String(item.id), item.name]));
}

function mapPlant(item, classificationMap, rarityMap, attributeMap) {
  return {
    id: String(item.id),
    name: item.name,
    avatar: item.avatar,
    rarity: rarityMap.get(String(item.rarity)) ?? "未知",
    classification: classificationMap.get(String(item.profession)) ?? "未知",
    attributes: (item.attribute ?? [])
      .map((id) => attributeMap.get(String(id)) ?? "未知")
      .filter(Boolean),
    stats: {
      durability: Number(item.order_life) || 0,
      planting: Number(item.order_zhongzhi) || 0,
      attack: Number(item.order_gongji) || 0,
      range: Number(item.order_shecheng) || 0,
      support: Number(item.order_fuzhu) || 0,
      control: Number(item.order_kongzhi) || 0,
    },
  };
}

function mapZombie(item, classificationMap, attributeMap) {
  return {
    id: String(item.id),
    name: item.name,
    avatar: item.avatar,
    classification: classificationMap.get(String(item.profession)) ?? "未知",
    attributes: (item.attribute ?? [])
      .map((id) => attributeMap.get(String(id)) ?? "未知")
      .filter(Boolean),
    rarity: Number(item.rarity) || 0,
    stats: {
      strength: Number(item.tag_strength) || 0,
      speed: Number(item.tag_speed) || 0,
    },
  };
}

async function main() {
  const [plantList, plantFilters, zombieList, zombieFilters] = await Promise.all([
    fetchJson(requestUrls.plants),
    fetchJson(requestUrls.plantFilters),
    fetchJson(requestUrls.zombies),
    fetchJson(requestUrls.zombieFilters),
  ]);

  const plantClassificationMap = toNameMap(plantFilters.data.classification);
  const plantRarityMap = toNameMap(plantFilters.data.rarity);
  const plantAttributeMap = toNameMap(plantFilters.data.attribute);
  const zombieClassificationMap = toNameMap(zombieFilters.data.classification);
  const zombieAttributeMap = toNameMap(zombieFilters.data.attribute);

  const payload = {
    fetchedAt: new Date().toISOString(),
    sources: requestUrls,
    plants: plantList.data.map((item) =>
      mapPlant(item, plantClassificationMap, plantRarityMap, plantAttributeMap),
    ),
    zombies: zombieList.data.map((item) =>
      mapZombie(item, zombieClassificationMap, zombieAttributeMap),
    ),
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(
    `Synced ${payload.plants.length} plants and ${payload.zombies.length} zombies to ${outputFile}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
