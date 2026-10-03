interface PlayerHeaderProps {
  name?: string;
  color: string;
  outlineColor?: string;
  ai?: boolean;
  won?: boolean;
  civ?: string;
  team?: number | string;
  className?: string;
}

export function PlayerHeader({
  name,
  color,
  outlineColor = "#ffffff",
  ai = false,
  won = false,
  civ,
  team,
  className = "",
}: PlayerHeaderProps) {

  return (
    <div className={`flex items-start justify-between ${className}`.trim()}>
      <div className="flex flex-col">
        <h3 className="text-lg font-bold leading-tight flex items-center gap-2">
          {name}
          {won && <sup>👑</sup>}
        </h3>
        {(civ || team !== undefined) && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            {civ && <span>{civ}</span>}
            {civ && team !== undefined && <span>•</span>}
            {team !== undefined && <span>Team {team}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center shrink-0 ml-2">
        <span
          className="h-5 w-5 rounded-sm shrink-0 flex items-center justify-center font-bold text-xs leading-none tracking-wider select-none"
          style={{ background: color, color: outlineColor }}
        >
          {ai ? "AI" : null}
        </span>
      </div>
    </div>
  );
}

export const PlayerCardHeader = PlayerHeader;
