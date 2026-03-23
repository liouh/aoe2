import JSZip from "jszip";

/**
 * Checks if a buffer is a ZIP file and extracts the first .aoe2record file if it is.
 * @param buffer The input buffer (could be ZIP or raw replay)
 * @param filename The initial filename
 * @returns An object containing the (possibly extracted) buffer and filename
 */
export async function ensureUnzipped(
  buffer: ArrayBuffer,
  filename: string
): Promise<{ buffer: ArrayBuffer; filename: string }> {
  const uint8 = new Uint8Array(buffer.slice(0, 4));
  // ZIP magic number: PK\x03\x04
  if (
    uint8[0] === 0x50 &&
    uint8[1] === 0x4b &&
    uint8[2] === 0x03 &&
    uint8[3] === 0x04
  ) {
    try {
      const zip = await JSZip.loadAsync(buffer);
      const recordFile = Object.values(zip.files).find((f) =>
        f.name.toLowerCase().endsWith(".aoe2record")
      );
      if (recordFile) {
        return {
          buffer: await recordFile.async("arraybuffer"),
          filename: recordFile.name,
        };
      }
    } catch (e) {
      console.error("Failed to extract ZIP:", e);
    }
  }
  return { buffer, filename };
}
