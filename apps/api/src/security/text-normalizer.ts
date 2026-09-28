/**
 * Attackers dodge regexes with invisible characters ("ig\u200Bnore") and
 * look-alike spacing. Normalise before scanning so the patterns see what
 * a human would read.
 */
const ZERO_WIDTH_CHARS = /[\u200B-\u200D\u2060\uFEFF]/g;

export function normalizeForScanning(text: string): string {
  return text
    .normalize("NFKC") // fold full-width / stylised letters into plain ones
    .replace(ZERO_WIDTH_CHARS, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
