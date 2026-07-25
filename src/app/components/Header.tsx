"use client";

interface HeaderProps {
  showUrlInput: boolean;
  setShowUrlInput: (val: boolean) => void;
  setIsPlaying: (val: boolean) => void;
  replayUrl: string;
  setReplayUrl: (val: string) => void;
  handleFile: (file: File) => void;
  handleUrlLoad: () => void;
}

export function Header({
  showUrlInput,
  setShowUrlInput,
  setIsPlaying,
  replayUrl,
  setReplayUrl,
  handleFile,
  handleUrlLoad,
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="headline text-2xl md:text-3xl font-semibold text-[color:var(--foreground)] lg:text-4xl">
            <a
              href="https://liouh.com/home/"
              className="inline-flex items-center justify-center transition-all group mr-3 align-middle -mt-1"
              tabIndex={-1}
            >
              <img
                src="icon.png"
                alt="Home"
                className="w-5 h-5 lg:w-8 lg:h-8 transition-all duration-150 group-hover:rotate-180 group-hover:grayscale"
              />
            </a>
            <span className="text-[color:var(--muted)] font-black">AoE2</span> replay viewer
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-[color:var(--muted)] lg:text-lg">
            In-browser minimap playback + key stats + build timelines
          </p>
        </div>
        <div className="flex flex-col items-start lg:items-end gap-2">
          <div className="flex flex-row gap-2 min-h-[46px] lg:min-h-[78px] relative">
            {!showUrlInput ? (
              <>
                <label
                  className="group flex flex-row lg:flex-col items-center justify-center gap-2 px-3 py-2 lg:px-6 rounded-lg bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-white/20 hover:border-white/40 shadow-2xl cursor-pointer text-xs lg:text-sm font-semibold text-[color:var(--foreground)] outline-none focus-within:ring-1 focus-within:ring-white transition-all"
                  onClick={() => setIsPlaying(false)}
                >
                  <span className="text-xl lg:text-2xl">📁</span>
                  <span className="lg:inline">Open .aoe2record file</span>
                  <input
                    id="replay-file-input"
                    name="replay-file"
                    type="file"
                    accept=".aoe2record,.zip"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      handleFile(file);
                      event.target.value = "";
                    }}
                  />
                  <div
                    className="pointer-events-none group-hover:pointer-events-auto group-focus:pointer-events-auto group-focus-within:pointer-events-auto absolute top-full left-0 lg:right-0 lg:left-auto mt-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 w-[400px] lg:w-[480px] rounded-xl bg-black/95 px-4 py-3 text-left text-white shadow-xl border border-white/20 flex flex-col gap-1.5 backdrop-blur-sm cursor-default before:absolute before:inset-x-0 before:bottom-full before:h-2"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    <p className="font-semibold text-sm mb-0.5">Local replays are usually in:</p>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-0.5">Windows</p>
                      <code className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded block font-mono text-white/80">C:\Users\&lt;User&gt;\Games\Age of Empires 2 DE\&lt;ID&gt;\savegame</code>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-0.5 mt-1">Mac (Native)</p>
                      <code className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded block font-mono text-white/80 break-all whitespace-normal">~/Library/Application Support/Age of Empires 2 DE/&lt;ID&gt;/savegame</code>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-0.5 mt-1">Mac (Steam / CrossOver)</p>
                      <code className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded block font-mono text-white/80 break-all whitespace-normal">~/Library/Application Support/Steam/steamapps/compatdata/813780/pfx/drive_c/users/steamuser/Games/Age of Empires 2 DE/&lt;ID&gt;/savegame</code>
                    </div>
                  </div>
                </label>
                <button
                  type="button"
                  className="group flex flex-row lg:flex-col items-center justify-center gap-2 px-3 py-2 lg:px-6 rounded-lg bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-white/20 hover:border-white/40 shadow-2xl cursor-pointer text-xs lg:text-sm font-semibold text-[color:var(--foreground)] outline-none focus:ring-1 focus:ring-white transition-all"
                  onClick={() => {
                    setIsPlaying(false);
                    setShowUrlInput(true);
                    setReplayUrl("");
                  }}
                >
                  <span className="text-xl lg:text-2xl">🔗</span>
                  <span className="lg:inline">Load replay from URL</span>
                  <div
                    className="pointer-events-none group-hover:pointer-events-auto group-focus:pointer-events-auto group-focus-within:pointer-events-auto absolute top-full left-0 lg:right-0 lg:left-auto mt-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 w-[400px] lg:w-[480px] rounded-xl bg-black/95 px-4 py-3 text-left text-white shadow-xl border border-white/20 flex flex-col gap-1.5 backdrop-blur-sm cursor-default before:absolute before:inset-x-0 before:bottom-full before:h-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="font-semibold text-sm mb-0.5">Supported URL formats:</p>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-0.5">Official match API</p>
                      <code className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded block font-mono text-white/80 break-all whitespace-normal">https://api.ageofempires.com/...</code>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-0.5 mt-1">Short URLs</p>
                      <code className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded block font-mono text-white/80 break-all whitespace-normal">https://aoe.ms/replay/...</code>
                    </div>
                    <div className="mt-1 pt-2 border-t border-white/10">
                      <p className="text-[11px] text-white/70 leading-snug">
                        <strong>How to find:</strong> Find your match on <a href="https://www.ageofempires.com/stats/ageiide/" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline" tabIndex={-1}>AgeOfEmpires.com</a> or <a href="https://www.aoe2insights.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline" tabIndex={-1}>AoE2Insights.com</a>, right-click the replay's download button, and select <strong>Copy Link Address</strong>.
                      </p>
                    </div>
                  </div>
                </button>
              </>
            ) : (
              <div className="flex flex-row items-center gap-2 w-full ml-auto self-stretch">
                <div className="flex-1 flex gap-2 items-center">
                  <input
                    autoFocus
                    id="replay-url-input"
                    name="replay-url"
                    type="url"
                    placeholder="Paste replay URL..."
                    className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[color:var(--accent)] transition-colors h-10 lg:h-12"
                    value={replayUrl}
                    onChange={(e) => setReplayUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUrlLoad();
                      }
                      if (e.key === "Escape") {
                        setShowUrlInput(false);
                      }
                    }}
                  />
                  <button
                    className="px-4 py-2 rounded-xl bg-[color:var(--panel)] hover:bg-[color:var(--accent)] border border-white/20 hover:border-[color:var(--accent)] text-xs lg:text-sm font-bold text-white transition-all active:scale-95 cursor-pointer h-10 lg:h-12"
                    onClick={handleUrlLoad}
                  >
                    Load
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-white/20 hover:border-white/40 text-xs lg:text-sm font-bold text-white transition-all active:scale-95 cursor-pointer h-10 lg:h-12"
                    onClick={() => setShowUrlInput(false)}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
