export const getBuildingIcon = (name: string): string | null => {
  const lower = name.toLowerCase();

  if (lower.includes("archery range")) return "🏹";
  if (lower.includes("barracks")) return "⚔️";
  if (lower.includes("blacksmith")) return "⚒️";
  if (lower.includes("bombard")) return "💣";
  if (lower.includes("caravanserai") || lower.includes("feitoria")) return "⭐";
  if (lower.includes("castle")) return "🏰";
  if (lower.includes("dock") || lower.includes("harbor") || lower.includes("shipyard") || lower.includes("port")) return "⚓";
  if (lower.includes("donjon") || lower.includes("krepost")) return "♜";
  if (lower.includes("farm") || lower.includes("fish trap") || lower.includes("pasture")) return "";
  if (lower.includes("fence") || lower.includes("wall")) return "";
  if (lower.includes("fortified church") || lower.includes("monastery")) return "⛪";
  if (lower.includes("gate")) return "⛩️";
  if (lower.includes("house")) return "";
  if (lower.includes("keep") || lower.includes("tower")) return "♟️";
  if (lower.includes("lumber camp")) return "🌲\uFE0E";
  if (lower.includes("market")) return "⚖️";
  if (lower.includes("mill") || lower.includes("folwark")) return "𖣘";
  if (lower.includes("mining camp")) return "⛏️";
  if (lower.includes("mule cart")) return "🦙";
  if (lower.includes("outpost")) return "📍";
  if (lower.includes("settlement")) return "🛖";
  if (lower.includes("siege workshop")) return "⚙️";
  if (lower.includes("stable")) return "🐎";
  if (lower.includes("town center")) return "🏠";
  if (lower.includes("university")) return "📖\uFE0E";
  if (lower.includes("wonder")) return "🎌";

  // scenario buildings
  if (lower.includes("amphitheatre") || lower.includes("arch of constantine") || lower.includes("colosseum") || lower.includes("palace") || lower.includes("pyramid") || lower.includes("stonehenge")) return "🏛️";
  if (lower.includes("banner") || lower.includes("flag") || lower.includes("gallow") || lower.includes("command post") || lower.includes("nine bands")) return "🏴";
  if (lower.includes("barricade") || lower.includes("mole") || lower.includes("scaffolding") || lower.includes("tunnel")) return "🚧";
  if (lower.includes("bridge")) return "";
  if (lower.includes("burned") || lower.includes("fire") || lower.includes("flame") || lower.includes("furnace") || lower.includes("smoke")) return "🔥";
  if (lower.includes("cart") || lower.includes("equipment") || lower.includes("goods") || lower.includes("granary") || lower.includes("stall") || lower.includes("storage") || lower.includes("trade workshop")) return "🏺";
  if (lower.includes("cathedral")) return "⛪︎";
  if (lower.includes("column") || lower.includes("monument") || lower.includes("statue") || lower.includes("tropaion")) return "🏆";
  if (lower.includes("dome of the rock") || lower.includes("gol gumbaz") || lower.includes("rock church") || lower.includes("sanchi stupa")) return "🕍";
  if (lower.includes("driftwood") || lower.includes("flotsam") || lower.includes("lumber")) return "🪾";
  if (lower.includes("fort")) return "♜";
  if (lower.includes("hall of heroes")) return "✨";
  if (lower.includes("hut") || lower.includes("pavilion") || lower.includes("tent") || lower.includes("yurt")) return "🎪";
  if (lower.includes("loot") || lower.includes("treasure")) return "💎";
  if (lower.includes("minaret") || lower.includes("mosque")) return "🕌";
  if (lower.includes("quarry") || lower.includes("ruins")) return "🪨";
  if (lower.includes("sankore madrasah") || lower.includes("shrine") || lower.includes("temple")) return "🏯";
  if (lower.includes("tomb")) return "🪦";
  if (lower.includes("tree") || lower.includes("vine")) return "🌿";

  return "❓";
};
