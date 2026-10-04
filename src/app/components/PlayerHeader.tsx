interface PlayerHeaderProps {
  name?: string;
  color: string;
  outlineColor?: string;
  ai?: boolean;
  won?: boolean;
  civ?: string;
  team?: number | string;
  action?: React.ReactNode;
}

export function PlayerHeader({
  name,
  color,
  outlineColor,
  ai = false,
  won = false,
  civ,
  team,
  action,
}: PlayerHeaderProps) {

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold leading-tight">{name}</h3>
        {(civ || team !== undefined || won) && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            {civ && <span>{civ}</span>}
            {civ && team !== undefined && <span>•</span>}
            {team !== undefined && <span>Team {team}</span>}
            {won && (
              <span className="inline-block -translate-y-0.5 select-none leading-none text-white" title="Winner">👑</span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center shrink-0">
        {action ?? (
          <span
            className="h-5 w-5 rounded-sm shrink-0 flex items-center justify-center font-bold text-xs leading-none tracking-wider select-none"
            style={{ background: color, color: outlineColor }}
          >
            {ai ? "AI" : null}
          </span>
        )}
      </div>
    </div>
  );
}
