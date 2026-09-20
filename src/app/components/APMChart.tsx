import React from "react";

const formatClock = (seconds: number) => {
  const total = Math.max(seconds, 0);
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AGE_LABELS: Record<string, string> = {
  Feudal: "II",
  Castle: "III",
  Imperial: "IV",
};

export function APMChart({
  data,
  players,
  getPlayerColor,
  selectedTime,
  ageTimings,
  hoveredPlayerId,
  isLogScale = false,
}: {
  data: { playerId: number; history: { minute: number; apm: number }[] }[];
  players: { id: number; name?: string; [key: string]: unknown }[];
  getPlayerColor: (id?: number) => string;
  selectedTime?: number;
  ageTimings?: { playerId: number; timings: Record<string, number>; textColor?: string }[];
  hoveredPlayerId?: number | null;
  isLogScale?: boolean;
}) {
  const isHoveredPlayerPlotted =
    hoveredPlayerId !== null &&
    hoveredPlayerId !== undefined &&
    data.some((d) => d.playerId === hoveredPlayerId);
  const allPoints = data.flatMap(d => d.history);
  if (allPoints.length === 0) return null;

  const maxMinute = Math.max(...allPoints.map(p => p.minute), 1);
  const rawMaxApm = Math.max(...allPoints.map(p => p.apm), 50);

  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 15, bottom: 40, left: 40 };

  const { yAxisMax, yTicks } = React.useMemo(() => {
    if (!isLogScale) {
      const steps = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000];
      let chosenStep = steps[steps.length - 1];
      for (const s of steps) {
        const intervals = Math.ceil(rawMaxApm / s);
        if (intervals <= 5 && intervals >= 3) {
          chosenStep = s;
          break;
        }
      }

      const ceiling = Math.max(Math.ceil(rawMaxApm / chosenStep) * chosenStep, chosenStep * 3);
      const ticks: number[] = [];
      for (let v = 0; v <= ceiling; v += chosenStep) {
        ticks.push(v);
      }
      return { yAxisMax: ceiling, yTicks: ticks };
    }

    // Log scale nice ceiling (10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000...)
    let ceiling = 10;
    const exp = Math.floor(Math.log10(rawMaxApm));
    const base = Math.pow(10, exp);
    const frac = rawMaxApm / base;
    if (frac <= 1) {
      ceiling = base;
    } else if (frac <= 2) {
      ceiling = 2 * base;
    } else if (frac <= 5) {
      ceiling = 5 * base;
    } else {
      ceiling = 10 * base;
    }
    ceiling = Math.max(ceiling, 50);

    const logMax = Math.log10(ceiling + 1);
    const plotHeight = height - padding.top - padding.bottom;
    const getYForVal = (v: number) => {
      const ratio = logMax > 0 ? Math.log10(v + 1) / logMax : 0;
      return height - padding.bottom - ratio * plotHeight;
    };

    const p10s = [0];
    for (let e = 1; Math.pow(10, e) < ceiling; e++) {
      p10s.push(Math.pow(10, e));
    }
    p10s.push(ceiling);

    const result: number[] = [];
    for (let i = 0; i < p10s.length; i++) {
      const curr = p10s[i];
      if (result.length > 0) {
        const prev = result[result.length - 1];
        const gap = getYForVal(prev) - getYForVal(curr);
        if (gap > 55) {
          const mid = (prev === 0 ? 5 : 5 * prev);
          if (mid < curr && getYForVal(prev) - getYForVal(mid) >= 22 && getYForVal(mid) - getYForVal(curr) >= 20) {
            result.push(mid);
          }
        }
      }
      if (curr === ceiling || getYForVal(curr) - getYForVal(ceiling) >= 20) {
        result.push(curr);
      }
    }
    if (!result.includes(ceiling)) result.push(ceiling);
    return { yAxisMax: ceiling, yTicks: result };
  }, [isLogScale, rawMaxApm]);

  const getX = (m: number) => padding.left + (m / maxMinute) * (width - padding.left - padding.right);
  const getY = (a: number) => {
    const clampedA = Math.max(a, 0);
    const plotHeight = height - padding.top - padding.bottom;
    if (isLogScale) {
      const logMax = Math.log10(yAxisMax + 1);
      const logVal = Math.log10(clampedA + 1);
      const ratio = logMax > 0 ? logVal / logMax : 0;
      return height - padding.bottom - ratio * plotHeight;
    }
    return height - padding.bottom - (clampedA / yAxisMax) * plotHeight;
  };


  // Build a lookup: playerId -> sorted history for APM interpolation
  const apmHistoryByPlayer = new Map(data.map(d => [d.playerId, d.history]));

  // The SVG line uses cubic Bézier segments with cp1y=prev.apm and cp2y=curr.apm,
  // so y(t) = sy*(1-t)²*(1+2t) + ey*t²*(3-2t)  (cubic Hermite basis).
  // cp1x=cp2x=midX, so x(t) normalises to the monotone cubic: f(t) = t³ - 1.5t² + 1.5t.
  // We binary-search t so that f(t) = u (the linear fraction within the segment),
  // then evaluate the true y on the curve — keeping the dot exactly on the line.
  const getLineYAtMinute = (playerId: number, targetMinute: number): number => {
    const history = apmHistoryByPlayer.get(playerId);
    if (!history || history.length === 0) return getY(0);

    for (let i = 0; i < history.length - 1; i++) {
      const prev = history[i], curr = history[i + 1];
      if (targetMinute >= prev.minute && targetMinute <= curr.minute) {
        // u is the linear fraction within this segment
        const u = (targetMinute - prev.minute) / (curr.minute - prev.minute);
        // Binary-search t ∈ [0,1] where t³ - 1.5t² + 1.5t = u
        let lo = 0, hi = 1;
        for (let iter = 0; iter < 32; iter++) {
          const t = (lo + hi) / 2;
          if (t * t * t - 1.5 * t * t + 1.5 * t < u) lo = t; else hi = t;
        }
        const t = (lo + hi) / 2;
        const sy = getY(prev.apm), ey = getY(curr.apm);
        return sy * (1 - t) * (1 - t) * (1 + 2 * t) + ey * t * t * (3 - 2 * t);
      }
    }
    if (targetMinute <= history[0].minute) return getY(history[0].apm);
    return getY(history[history.length - 1].apm);
  };


  const renderedAgeIndicators = (() => {
    if (!ageTimings) return [];
    const seenKeys = new Set<string>();
    const items: { playerId: number; node: React.ReactNode }[] = [];

    ageTimings.forEach((playerAge) => {
      const color = getPlayerColor(playerAge.playerId);
      const textColor = playerAge.textColor ?? "white";
      const isDimmed = isHoveredPlayerPlotted && playerAge.playerId !== hoveredPlayerId;

      Object.entries(playerAge.timings).forEach(([age, timeSeconds]) => {
        const key = `${playerAge.playerId}-${age}`;
        if (seenKeys.has(key)) return;
        seenKeys.add(key);

        const minute = timeSeconds / 60;
        const x = getX(minute);
        const label = AGE_LABELS[age] ?? age;

        if (x < padding.left || x > width - padding.right) return;

        const lineY = getLineYAtMinute(playerAge.playerId, minute);
        const badgeW = 18;
        const badgeH = 14;

        items.push({
          playerId: playerAge.playerId,
          node: (
            <g
              key={key}
              className="select-none pointer-events-none"
              style={{
                opacity: isDimmed ? 0 : 1,
                pointerEvents: "none",
                userSelect: "none",
                transition: "opacity 0.1s ease-out",
              }}
            >
              <rect
                x={x - badgeW / 2}
                y={lineY - badgeH / 2}
                width={badgeW}
                height={badgeH}
                rx={4}
                ry={4}
                fill={color}
                fillOpacity={0.75}
              />
              <text
                x={x}
                y={lineY}
                fill={textColor}
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                className="select-none pointer-events-none"
                style={{ fontFamily: "inherit", userSelect: "none" }}
              >
                {label}
              </text>
            </g>
          ),
        });
      });
    });

    if (isHoveredPlayerPlotted) {
      items.sort((a, b) => {
        if (a.playerId === hoveredPlayerId) return 1;
        if (b.playerId === hoveredPlayerId) return -1;
        return 0;
      });
    }

    return items.map((item) => item.node);
  })();

  const sortedData = isHoveredPlayerPlotted
    ? [...data].sort((a, b) => {
      if (a.playerId === hoveredPlayerId) return 1;
      if (b.playerId === hoveredPlayerId) return -1;
      return 0;
    })
    : data;

  const formatApmTick = (val: number) => {
    if (val >= 1000) {
      const k = val / 1000;
      return `${Number(k.toFixed(1))}k`;
    }
    return `${val}`;
  };

  return (
    <div className="w-full bg-[#1c1610] rounded-2xl px-4 pt-4 pb-2 border border-white/5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-sm uppercase tracking-widest text-white/30 whitespace-nowrap">APM over time</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {players.map((p, idx) => {
            const isDimmed = isHoveredPlayerPlotted && hoveredPlayerId !== p.id;
            return (
              <div
                key={`${p.id}-${idx}`}
                className="flex items-center gap-1.5 whitespace-nowrap"
                style={{
                  opacity: isDimmed ? 0.15 : 1,
                  transition: "opacity 0.1s ease-out",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: getPlayerColor(p.id),
                  }}
                />
                <span className="text-[10px] text-white/50">{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        {/* Y Axis Grid & Labels */}
        {yTicks.map((val) => {
          const y = getY(val);
          return (
            <g key={val} className="text-white/20">
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" strokeDasharray="4 4" />
              <text x={padding.left - 12} y={y} fill="currentColor" fontSize="10" textAnchor="end" alignmentBaseline="middle">{formatApmTick(val)}</text>
            </g>
          );
        })}

        {/* X Axis Grid & Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const val = Math.round(p * maxMinute);
          const x = getX(val);
          return (
            <g key={p} className="text-white/20">
              <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="currentColor" strokeDasharray="4 4" />
              <text x={x} y={height - 15} fill="currentColor" fontSize="10" textAnchor="middle">{val}m</text>
            </g>
          );
        })}

        {/* Current Time Indicator */}
        {selectedTime !== undefined && selectedTime > 0 && (
          <g>
            <line
              x1={Math.min(getX(selectedTime / 60), width - padding.right)}
              y1={padding.top}
              x2={Math.min(getX(selectedTime / 60), width - padding.right)}
              y2={height - padding.bottom}
              stroke="var(--foreground)"
              strokeWidth="2"
            />
            <foreignObject
              x={Math.min(getX(selectedTime / 60), width - padding.right) - 25}
              y={padding.top - 14}
              width="50"
              height="30"
            >
              <div className="flex justify-center">
                <span className="rounded bg-[color:var(--foreground)] px-1 py-0.5 text-[9px] font-bold tabular-nums text-[color:var(--panel)] shadow-sm whitespace-nowrap">
                  {formatClock(selectedTime)}
                </span>
              </div>
            </foreignObject>
          </g>
        )}

        {/* Lines */}
        {sortedData.map((playerData) => {
          const color = getPlayerColor(playerData.playerId);
          if (playerData.history.length < 2) return null;

          const isLineHovered = isHoveredPlayerPlotted && playerData.playerId === hoveredPlayerId;
          const isLineDimmed = isHoveredPlayerPlotted && !isLineHovered;

          // Use a smooth path
          let d = `M ${getX(playerData.history[0].minute)} ${getY(playerData.history[0].apm)}`;
          for (let i = 1; i < playerData.history.length; i++) {
            const p = playerData.history[i];
            const prev = playerData.history[i - 1];
            const cp1x = getX(prev.minute + (p.minute - prev.minute) / 2);
            const cp1y = getY(prev.apm);
            const cp2x = getX(prev.minute + (p.minute - prev.minute) / 2);
            const cp2y = getY(p.apm);
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${getX(p.minute)} ${getY(p.apm)}`;
          }

          return (
            <path
              key={playerData.playerId}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={isLineHovered ? 3 : isLineDimmed ? 1 : 2}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{
                opacity: isLineDimmed ? 0.15 : 1,
                transition: "opacity 0.1s ease-out, stroke-width 0.1s ease-out",
              }}
            />
          );
        })}

        {/* Age-up Indicators */}
        {renderedAgeIndicators}
      </svg>
    </div>
  );
}
