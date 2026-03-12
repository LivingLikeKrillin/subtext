import type { SttSegment } from "@/types";

/**
 * Clean STT segments by removing hallucinations and noise.
 * Applied after STT completes, before translation.
 */
export function cleanSttSegments(segments: SttSegment[]): SttSegment[] {
  return segments
    .map((seg) => ({ ...seg, text: cleanText(seg.text) }))
    .filter((seg) => seg.text.length > 0);
}

/** Clean a single text string */
export function cleanText(text: string): string {
  let cleaned = text.trim();

  // 1. Collapse repeated single characters (5+ → 1)
  //    "아아아아아아아" → "아", "hhhhhhhhh" → "h"
  cleaned = cleaned.replace(/(.)\1{4,}/g, "$1");

  // 2. Collapse repeated syllable groups (3+ → 1)
  //    "lalalalala" → "la", "ㅋㅋㅋㅋㅋㅋ" → "ㅋㅋ" (after step 1)
  cleaned = cleaned.replace(/(.{2,4})\1{2,}/g, "$1");

  // 3. Collapse repeated sentences/phrases (3+ → 1)
  //    "Thank you. Thank you. Thank you." → "Thank you."
  cleaned = cleaned.replace(/(.{3,40}?[.!?。！？])\s*(?:\1\s*){2,}/g, "$1");

  // 4. Remove segments that are just punctuation/whitespace noise
  cleaned = cleaned.replace(/^[\s.,!?…·\-_*#@~]+$/, "");

  return cleaned.trim();
}

/** Check if a segment looks like hallucination (for flagging) */
export function isLikelyHallucination(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;

  // Extremely long single segment (>500 chars) is suspicious
  if (trimmed.length > 500) return true;

  // More than 70% is the same character
  const charCounts = new Map<string, number>();
  for (const ch of trimmed) {
    charCounts.set(ch, (charCounts.get(ch) ?? 0) + 1);
  }
  const maxCount = Math.max(...charCounts.values());
  if (maxCount / trimmed.length > 0.7) return true;

  return false;
}
