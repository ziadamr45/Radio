/**
 * Arabic search normalization utility
 * Makes search tolerant of common Arabic typing mistakes and variations:
 * - تاء مربوطة (ة) ↔ هاء (ه)
 * - أ إ آ ا → all normalized to ا
 * - ى ↔ ي
 * - Extra whitespace trimmed and collapsed
 * - Diacritics (tashkeel) removed
 * - Common ligatures normalized
 */

// Arabic character normalization map
const NORMALIZATION_MAP: Record<string, string> = {
  // تاء مربوطة → هاء
  'ة': 'ه',
  // ألف المقصورة → ياء
  'ى': 'ي',
  // ألف forms → bare alif
  'أ': 'ا',
  'إ': 'ا',
  'آ': 'ا',
  'ٱ': 'ا',
  // Waw with hamza → waw
  'ؤ': 'و',
  // Ya with hamza → ya
  'ئ': 'ي',
};

// Arabic diacritics (tashkeel) range: 0x0610-0x061A, 0x064B-0x065F, 0x0670
const DIACRITICS_REGEX = /[\u0610-\u061A\u064B-\u065F\u0670]/g;

/**
 * Normalize Arabic text for search comparison
 * Handles: ة↔ه, أ/إ/آ→ا, ى↔ي, diacritics, extra spaces
 */
export function normalizeSearch(text: string): string {
  if (!text) return '';

  return text
    // Remove diacritics first (tashkeel)
    .replace(DIACRITICS_REGEX, '')
    // Apply character normalization
    .split('')
    .map((char) => NORMALIZATION_MAP[char] || char)
    .join('')
    // Trim and collapse multiple spaces
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Check if a target string matches a normalized search query
 * Both strings are normalized before comparison
 */
export function matchesSearch(target: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!target) return false;

  const normalizedTarget = normalizeSearch(target);
  const normalizedQuery = normalizeSearch(query);

  return normalizedTarget.includes(normalizedQuery);
}
