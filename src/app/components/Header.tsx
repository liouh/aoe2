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
          <h1 className="headline text-2xl md:text-3xl lg:text-4xl font-semibold text-[color:var(--accent)]">
            Age of Empires II{" "}
            <span className="text-[color:var(--foreground)]">replay viewer</span>
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-[color:var(--muted)] lg:text-lg">
            In-browser minimap playback + key stats + build timeline
          </p>
        </div>
        <div className="flex flex-col items-start lg:items-end gap-2">
          <div className="flex flex-row gap-2 min-h-[46px] lg:min-h-[78px] relative">
            {!showUrlInput ? (
              <>
                <label
                  className="group flex flex-row lg:flex-col items-center justify-center text-center gap-2 px-3 py-2 lg:px-5 rounded-lg bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-[color:var(--btn-border)] hover:border-[color:var(--btn-border-hover)] shadow-md cursor-pointer text-xs lg:text-sm font-semibold text-[color:var(--foreground)] outline-none focus-within:ring-2 focus-within:ring-[color:var(--focus-ring)] transition-all select-none"
                  onClick={() => setIsPlaying(false)}
                  onMouseEnter={(e) => {
                    const active = document.activeElement;
                    if (active instanceof HTMLElement && e.currentTarget.parentElement?.contains(active)) {
                      active.blur();
                    }
                  }}
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
                    className="pointer-events-none group-hover:pointer-events-auto group-focus:pointer-events-auto group-focus-within:pointer-events-auto absolute top-full left-0 lg:right-0 lg:left-auto mt-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 w-[390px] lg:w-[450px] rounded-xl bg-[color:var(--panel)] px-4 py-3 text-left text-[color:var(--foreground)] shadow-2xl border border-[color:var(--btn-border)] flex flex-col gap-1.5 backdrop-blur-md cursor-default before:absolute before:inset-x-0 before:bottom-full before:h-2"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    <p className="font-semibold text-sm mb-0.5 text-[color:var(--foreground)]">Local replays are usually in:</p>
                    <div>
                      <p className="text-[10px] text-[color:var(--muted)] uppercase font-bold tracking-wider mb-0.5">Windows</p>
                      <code className="text-[10px] bg-[color:var(--btn-subtle-bg)] px-1.5 py-0.5 rounded block font-mono text-[color:var(--foreground)]/80">C:\Users\&lt;User&gt;\Games\Age of Empires 2 DE\&lt;ID&gt;\savegame</code>
                    </div>
                    <div>
                      <p className="text-[10px] text-[color:var(--muted)] uppercase font-bold tracking-wider mb-0.5 mt-1">Mac (Native)</p>
                      <code className="text-[10px] bg-[color:var(--btn-subtle-bg)] px-1.5 py-0.5 rounded block font-mono text-[color:var(--foreground)]/80 break-all whitespace-normal">~/Library/Application Support/Age of Empires 2 DE/&lt;ID&gt;/savegame</code>
                    </div>
                    <div>
                      <p className="text-[10px] text-[color:var(--muted)] uppercase font-bold tracking-wider mb-0.5 mt-1">Mac (Steam / CrossOver)</p>
                      <code className="text-[10px] bg-[color:var(--btn-subtle-bg)] px-1.5 py-0.5 rounded block font-mono text-[color:var(--foreground)]/80 break-all whitespace-normal">~/Library/Application Support/Steam/steamapps/compatdata/813780/pfx/drive_c/users/steamuser/Games/Age of Empires 2 DE/&lt;ID&gt;/savegame</code>
                    </div>
                  </div>
                </label>
                <button
                  type="button"
                  className="group flex flex-row lg:flex-col items-center justify-center text-center gap-2 px-3 py-2 lg:px-5 rounded-lg bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-[color:var(--btn-border)] hover:border-[color:var(--btn-border-hover)] shadow-md cursor-pointer text-xs lg:text-sm font-semibold text-[color:var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] transition-all select-none"
                  onClick={() => {
                    setIsPlaying(false);
                    setShowUrlInput(true);
                    setReplayUrl("");
                  }}
                  onMouseEnter={(e) => {
                    const active = document.activeElement;
                    if (active instanceof HTMLElement && e.currentTarget.parentElement?.contains(active)) {
                      active.blur();
                    }
                  }}
                >
                  <span className="text-xl lg:text-2xl">🔗</span>
                  <span className="lg:inline">Load replay from URL</span>
                  <div
                    className="pointer-events-none group-hover:pointer-events-auto group-focus:pointer-events-auto group-focus-within:pointer-events-auto absolute top-full left-0 lg:right-0 lg:left-auto mt-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 w-[390px] lg:w-[450px] rounded-xl bg-[color:var(--panel)] px-4 py-3 text-left text-[color:var(--foreground)] shadow-2xl border border-[color:var(--btn-border)] flex flex-col gap-1.5 backdrop-blur-md cursor-default before:absolute before:inset-x-0 before:bottom-full before:h-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="font-semibold text-sm mb-0.5 text-[color:var(--foreground)]">Supported URL formats:</p>
                    <div>
                      <p className="text-[10px] text-[color:var(--muted)] uppercase font-bold tracking-wider mb-0.5">Official match API</p>
                      <code className="text-[10px] bg-[color:var(--btn-subtle-bg)] px-1.5 py-0.5 rounded block font-mono text-[color:var(--foreground)]/80 break-all whitespace-normal">https://api.ageofempires.com/...</code>
                    </div>
                    <div>
                      <p className="text-[10px] text-[color:var(--muted)] uppercase font-bold tracking-wider mb-0.5 mt-1">Short URLs</p>
                      <code className="text-[10px] bg-[color:var(--btn-subtle-bg)] px-1.5 py-0.5 rounded block font-mono text-[color:var(--foreground)]/80 break-all whitespace-normal">https://aoe.ms/replay/...</code>
                    </div>
                    <div className="mt-1 pt-2 border-t border-[color:var(--border-subtle)]">
                      <p className="text-[11px] text-[color:var(--muted)] leading-snug">
                        Find your match on <a href="https://www.ageofempires.com/stats/ageiide/" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 hover:underline" tabIndex={-1}>AgeOfEmpires.com</a> or <a href="https://www.aoe2insights.com/" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 hover:underline" tabIndex={-1}>AoE2Insights.com</a>, right-click the replay's download button, and select <strong>Copy Link Address</strong>.
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
                    className="flex-1 rounded-lg bg-[color:var(--panel-strong)] border border-[color:var(--btn-border)] px-4 py-2.5 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] outline-none focus:border-[color:var(--focus-ring)] focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring)] transition-colors h-10 lg:h-12 min-w-[230px]"
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
                    className="px-4 py-2 rounded-lg bg-[color:var(--panel)] hover:bg-[color:var(--accent)] border border-white/20 hover:border-[color:var(--accent)] text-xs lg:text-sm font-bold text-[color:var(--foreground)] hover:text-white transition-all active:scale-95 cursor-pointer h-10 lg:h-12"
                    onClick={handleUrlLoad}
                  >
                    Load
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-white/20 hover:border-white/40 text-xs lg:text-sm font-bold text-[color:var(--foreground)] transition-all active:scale-95 cursor-pointer h-10 lg:h-12"
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
