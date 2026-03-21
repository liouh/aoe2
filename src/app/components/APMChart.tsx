import React from "react";

const formatClock = (seconds: number) => {
  const total = Math.max(seconds, 0);
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function APMChart({ data, players, classifyColor, selectedTime }: {
  data: { playerId: number; history: { minute: number; apm: number }[] }[],
  players: any[],
  classifyColor: (id?: number) => string,
  selectedTime?: number
}) {
  const allPoints = data.flatMap(d => d.history);
  if (allPoints.length === 0) return null;

  const maxMinute = Math.max(...allPoints.map(p => p.minute), 1);
  const maxApm = Math.max(...allPoints.map(p => p.apm), 50);

  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 15, bottom: 40, left: 40 };

  const getX = (m: number) => padding.left + (m / maxMinute) * (width - padding.left - padding.right);
  const getY = (a: number) => height - padding.bottom - (a / maxApm) * (height - padding.top - padding.bottom);

  return (
    <div className="w-full bg-[#1c1610] rounded-2xl px-4 pt-4 pb-2 border border-white/5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/30">APM over time</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {players.map((p, idx) => (
            <div key={`${p.id}-${idx}`} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full" style={{ background: classifyColor(p.id) }}></span>
              <span className="text-[10px] text-white/50">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Y Axis Grid & Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const val = Math.round(p * maxApm);
          const y = getY(val);
          return (
            <g key={p} className="text-white/20">
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" strokeDasharray="4 4" />
              <text x={padding.left - 12} y={y} fill="currentColor" fontSize="10" textAnchor="end" alignmentBaseline="middle">{val}</text>
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
              x1={getX(selectedTime / 60)}
              y1={padding.top}
              x2={getX(selectedTime / 60)}
              y2={height - padding.bottom}
              stroke="var(--foreground)"
              strokeWidth="2"
            />
            <foreignObject
              x={getX(selectedTime / 60) - 25}
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
        {data.map((playerData, idx) => {
          const color = classifyColor(playerData.playerId);
          if (playerData.history.length < 2) return null;

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
              key={`${playerData.playerId}-${idx}`}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
            />
          );
        })}
      </svg>
    </div>
  );
}
