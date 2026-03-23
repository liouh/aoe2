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
      <div className="flex flex-wrap items-stretch justify-between gap-4">
        <div className="space-y-1">
          <h1 className="headline text-2xl font-semibold text-[color:var(--foreground)] lg:text-4xl">
            <span className="text-[color:var(--muted)] font-black">AoE2</span> Replay Viewer
          </h1>
          <p className="max-w-2xl text-sm text-[color:var(--muted)] lg:text-lg mb-3">
            In-browser minimap playback + key stats + build timelines
          </p>
        </div>
        <div className="flex flex-row gap-2">
          {!showUrlInput ? (
            <>
              <label
                className="flex flex-row lg:flex-col items-center justify-center gap-2 px-3 py-2 lg:px-6 rounded-2xl bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-white/20 hover:border-white/40 shadow-2xl cursor-pointer text-xs lg:text-sm font-semibold text-[color:var(--foreground)] outline-none focus-within:ring-1 focus-within:ring-white transition-all"
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
                  }}
                />
              </label>
              <button
                type="button"
                className="flex flex-row lg:flex-col items-center justify-center gap-2 px-3 py-2 lg:px-6 rounded-2xl bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)] border border-white/20 hover:border-white/40 shadow-2xl cursor-pointer text-xs lg:text-sm font-semibold text-[color:var(--foreground)] outline-none focus:ring-1 focus:ring-white transition-all"
                onClick={() => {
                  setIsPlaying(false);
                  setShowUrlInput(true);
                  setReplayUrl("");
                }}
              >
                <span className="text-xl lg:text-2xl">🔗</span>
                <span className="lg:inline">Load replay from URL</span>
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
    </header>
  );
}
