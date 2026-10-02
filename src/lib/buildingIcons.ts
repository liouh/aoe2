export const getBuildingIcon = (name: string): string | null => {
  const lower = name.toLowerCase();

  if (lower.includes("farm") || lower.includes("pasture") || lower.includes("fish trap")) return "";
  if (lower.includes("house")) return "";
  if (lower.includes("wall") || lower.includes("fence")) return "";
  if (lower.includes("archery range")) return "🏹";
  if (lower.includes("barracks")) return "⚔️";
  if (lower.includes("blacksmith")) return "⚒️";
  if (lower.includes("castle")) return "🏰";
  if (lower.includes("dock") || lower.includes("harbor") || lower.includes("shipyard") || lower.includes("port")) return "⚓";
  if (lower.includes("feitoria") || lower.includes("caravanserai")) return "🏛️";
  if (lower.includes("gate")) return "⛩️";
  if (lower.includes("lumber camp")) return "🌲\uFE0E";
  if (lower.includes("market")) return "⚖️";
  if (lower.includes("mill") || lower.includes("folwark")) return "𖣘";
  if (lower.includes("mining camp")) return "⛏️";
  if (lower.includes("monastery") || lower.includes("church") || lower.includes("temple") || lower.includes("shrine")) return "⛪︎";
  if (lower.includes("mule cart")) return "🛷";
  if (lower.includes("outpost")) return "📍";
  if (lower.includes("settlement")) return "🛖";
  if (lower.includes("siege workshop")) return "⚙️";
  if (lower.includes("stable")) return "🐎"; //🐴
  if (lower.includes("tower") || lower.includes("donjon") || lower.includes("krepost") || lower.includes("fort")) return "♜";
  if (lower.includes("town center")) return "🏠";
  if (lower.includes("university")) return "📖\uFE0E";
  if (lower.includes("wonder")) return "⭐";

  // scenario buildings
  if (lower.includes("bridge")) return "";
  if (lower.includes("fire") || lower.includes("smoke")) return "🔥";
  if (lower.includes("flag")) return "🚩";
  if (lower.includes("goods") || lower.includes("trade workshop")) return "📦";
  if (lower.includes("lumber")) return "🪵";
  if (lower.includes("ruins")) return "🗿";
  if (lower.includes("quarry")) return "🪨";
  if (lower.includes("statue")) return "🏺";
  if (lower.includes("hall of heroes")) return "✨";
  if (lower.includes("yurt") || lower.includes("tent")) return "⛺";

  return "❓";
};
