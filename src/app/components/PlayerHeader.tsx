interface PlayerHeaderProps {
  name?: string;
  color?: string;
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
        <h3 className="text-lg font-semibold leading-tight">
          {name}
          {won && (
            <span className="inline-block ml-1.5 -translate-y-1 text-sm font-normal text-[color:var(--accent)] select-none leading-none" title="Winner">🜲</span>
          )}
        </h3>
        {(civ || team !== undefined) && (
          <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
            {civ && <span>{civ}</span>}
            {civ && team !== undefined && <span>•</span>}
            {team !== undefined && <span>Team {team}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center shrink-0">
        {action ?? (
          <span
            className="mt-1 h-4 w-4 rounded-sm shrink-0 flex items-center justify-center font-bold text-[10px] leading-none tracking-wider select-none"
            style={{ background: color, color: outlineColor }}
          >
            {ai ? "AI" : null}
          </span>
        )}
      </div>
    </div>
  );
}
