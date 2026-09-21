// Based on official AoE2 DE dataset (siegeengineers/aoc-reference-data)
// and AoE2ScenarioParser (datasets/terrains.py).
// Valid terrain IDs in DE range from 0 to 130.

export const TERRAIN_MINIMAP_COLORS: Record<number, string> = {
  0: "#00a900", // Grass 1
  1: "#305db6", // Water, Shallow
  2: "#f8c98a", // Beach
  3: "#f3aa5c", // Dirt 3
  4: "#5492b0", // Shallows
  5: "#00a900", // Underbrush
  6: "#f3aa5c", // Dirt 1
  7: "#8a8b57", // Farm 1
  8: "#8a8b57", // Farm 2 (Dead)
  9: "#00a900", // Grass 3
  10: "#257439", // Forest (Oak)
  11: "#f3aa5c", // Dirt 2
  12: "#00a900", // Grass 2
  13: "#257439", // Forest (Palm Desert)
  14: "#f8c98a", // Desert (Sand)
  15: "#305db6", // Water 2D Shoreless
  16: "#00a900", // Grass Other
  17: "#257439", // Forest (Jungle)
  18: "#257439", // Forest (Bamboo)
  19: "#257439", // Forest (Pine)
  20: "#257439", // Forest (Oak Bush)
  21: "#257439", // Forest (Pine Snow)
  22: "#004aa1", // Water, Deep
  23: "#004abb", // Water, Medium
  24: "#f3aa5c", // Road
  25: "#f3aa5c", // Road, Broken
  26: "#98c0f0", // Ice, Navigable
  27: "#f3aa5c", // Grass Foundation
  28: "#305db6", // Water 2D Bridge
  29: "#8a8b57", // Farm 0
  30: "#8a8b57", // Farm 33
  31: "#8a8b57", // Farm 67
  32: "#f0f4f8", // Snow
  33: "#f3aa5c", // Obsolete Snow Dirt
  34: "#00a900", // Obsolete Snow Grass
  35: "#98c0f0", // Ice
  36: "#f3aa5c", // Snow Foundation
  37: "#98c0f0", // Beach, Ice
  38: "#f3aa5c", // Obsolete Road Snow
  39: "#f3aa5c", // Obsolete Road Fungus
  40: "#f3aa5c", // Rock 1
  41: "#f3aa5c", // Dirt Savannah
  42: "#f3aa5c", // Dirt 4
  43: "#f3aa5c", // Obsolete Road Desert
  44: "#00a900", // Obsolete Dirt Mud
  45: "#f8c98a", // Desert, Cracked
  46: "#f8c98a", // Desert, Quicksand
  47: "#1c1c1c", // Black
  48: "#257439", // Forest (Dragon Tree)
  49: "#257439", // Forest (Baobab)
  50: "#257439", // Forest (Acacia)
  51: "#f8c98a", // Beach (White Vegetation)
  52: "#f8c98a", // Beach (Vegetation)
  53: "#f8c98a", // Beach (White)
  54: "#5492b0", // Shallows (Mangrove)
  55: "#257439", // Forest (Mangrove)
  56: "#257439", // Forest (Rainforest)
  57: "#004aa1", // Water (Deep Ocean)
  58: "#0054b0", // Water (Azure)
  59: "#5492b0", // Shallows (Azure)
  60: "#00a900", // Grass (Jungle)
  61: "#f3aa5c", // Obsolete Road Jungle
  62: "#00a900", // Obsolete Underbrush Jungle
  63: "#8a8b57", // Rice Farm
  64: "#8a8b57", // Rice Farm (Dead)
  65: "#8a8b57", // Rice Farm 0
  66: "#8a8b57", // Rice Farm 33
  67: "#8a8b57", // Rice Farm 67
  68: "#00a900", // Reserved
  69: "#1c1c1c", // Corruption
  70: "#f8c98a", // Gravel Default
  71: "#00a900", // Underbrush (Leaves)
  72: "#b8cfb8", // Underbrush (Snow)
  73: "#e2ebf2", // Snow, Light
  74: "#ffffff", // Snow, Strong
  75: "#f3aa5c", // Road (Fungus)
  76: "#f3aa5c", // Dirt Mud
  77: "#00a900", // Underbrush (Jungle)
  78: "#f3aa5c", // Road (Gravel)
  79: "#f8c98a", // Beach (Non-Navigable)
  80: "#f8c98a", // Beach (Non-Navigable Wet Sand)
  81: "#f8c98a", // Beach (Non-Navigable Wet Gravel)
  82: "#f8c98a", // Beach (Non-Navigable Wet Rock)
  83: "#00a900", // Grass (Jungle Rainforest)
  84: "#00a900", // Moddable Grass 1
  85: "#00a900", // Moddable Grass 2
  86: "#00a900", // Moddable Grass 3
  87: "#00a900", // Moddable Grass 4
  88: "#257439", // Forest (Mediterranean)
  89: "#257439", // Forest (Bush)
  90: "#5492b0", // Forest (Reeds Shallows)
  91: "#257439", // Forest (Reeds Beach)
  92: "#257439", // Forest (Reeds)
  93: "#5492b0", // Moddable Shallows 1
  94: "#5492b0", // Moddable Shallows 2
  95: "#305db6", // Water (Green)
  96: "#305db6", // Water (Brown)
  97: "#305db6", // Moddable Normal Water 1
  98: "#305db6", // Moddable Normal Water 2
  99: "#305db6", // Moddable Deep Water
  100: "#00a900", // Grass, Dry
  101: "#5492b0", // Swamp, Bogland
  102: "#f8c98a", // Gravel Desert
  103: "#f3aa5c", // Obsolete Road Gravel
  104: "#257439", // Forest (Autumn)
  105: "#257439", // Forest (Autumn Snow)
  106: "#257439", // Forest (Dead)
  107: "#f8c98a", // Beach, Wet
  108: "#f8c98a", // Beach, Wet Gravel
  109: "#f8c98a", // Beach, Wet Rock
  110: "#257439", // Forest (Birch)
  111: "#5492b0", // Swamp, Shallows
  112: "#257439", // Forest (Palm Grass)
  113: "#257439", // Forest (Lush Bamboo)
  114: "#305db6", // Water (Yellow Shallow)
  115: "#5492b0", // Shallows (Yellow)
  116: "#305db6", // Water (Yellow Deep)
  117: "#00a900", // Pasture
  118: "#8a8b57", // Pasture (Dead)
  119: "#00a900", // Pasture 0
  120: "#00a900", // Pasture 33
  121: "#00a900", // Pasture 67
  122: "#00a900", // Grass (Flowers 1)
  123: "#00a900", // Grass (Flowers 2)
  124: "#f0f4f8", // Snow, Soft
  125: "#e2ebf2", // Snow, Soft Light
  126: "#ffffff", // Snow, Soft Strong
  127: "#98c0f0", // Ice, Soft
  128: "#257439", // Forest (Dry South American)
  129: "#1c1c1c", // Black (Walkable)
  130: "#305db6", // Water (Weeds)
};
