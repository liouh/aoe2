export const getBuildingIcon = (name: string): string | null => {
  let icon: string | null = null;

  if (name.includes("Farm") || name.includes("Pasture")) icon = "";
  else if (name.includes("Archery Range")) icon = "🏹";
  else if (name.includes("Barracks")) icon = "⚔️";
  else if (name.includes("Blacksmith")) icon = "⚒️";
  else if (name.includes("Dock") || name.includes("Harbor")) icon = "⚓";
  else if (name.includes("Feitoria") || name.includes("Caravanserai")) icon = "🏛️";
  else if (name.includes("Gate")) icon = "⛩️";
  else if (name.includes("House")) icon = "🏠︎";
  else if (name.includes("Lumber Camp")) icon = "🌲\uFE0E";
  else if (name.includes("Market")) icon = "⚖️";
  else if (name.includes("Mill") || name.includes("Folwark")) icon = "🌿";
  else if (name.includes("Mining Camp")) icon = "⛏️";
  else if (name.includes("Monastery") || name.includes("Church")) icon = "🕯️";
  else if (name.includes("Mule Cart")) icon = "🛷";
  else if (name.includes("Outpost")) icon = "👁";
  else if (name.includes("Settlement")) icon = "🛖";
  else if (name.includes("Siege Workshop")) icon = "⚙️";
  else if (name.includes("Stable")) icon = "🐴";
  else if (name.includes("Tower") || name.includes("Donjon") || name.includes("Krepost")) icon = "♜";
  else if (name.includes("University")) icon = "📖\uFE0E";
  else if (name.includes("Palisade Wall")) icon = "▯";
  else if (name.includes("Wall")) icon = "▮";
  else if (name.includes("Wonder")) icon = "⭐";
  else icon = "❓";

  return icon;
};
