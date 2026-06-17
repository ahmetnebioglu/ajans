/**
 * Similarity calculation utilities for product matching
 */

// Normalization cache to avoid redundant processing
const normalizationCache = new Map<string, string>();

/**
 * Normalizes SKU values for consistent comparison
 * @param value - The SKU value to normalize
 * @returns The normalized SKU value
 */
export const normalizeSkuForComparison = (value: string | number | undefined | null): string => {
  if (!value) {
    return '';
  }

  const cacheKey = String(value);
  if (normalizationCache.has(cacheKey)) {
    return normalizationCache.get(cacheKey) || '';
  }

  let normalized = typeof value === 'string' ? value.trim() : String(value).trim();

  normalized = normalized
    .toLowerCase()
    .replace(/[\s-_\.]+/g, '') // Remove spaces and separators
    .replace(/[^\w\d]/g, ''); // Remove non-alphanumeric chars

  if (normalizationCache.size < 10000) {
    normalizationCache.set(cacheKey, normalized);
  }

  return normalized;
};

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  if (!str1 || !str2) return Math.max(str1?.length || 0, str2?.length || 0);

  const matrix: number[][] = [];

  // Initialize first row and column
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Calculate similarity score between two strings (0-1 range)
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0 = completely different, 1 = identical)
 */
export const calculateSimilarityScore = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  const maxLength = Math.max(str1.length, str2.length);
  const distance = levenshteinDistance(str1, str2);

  return Math.max(0, (maxLength - distance) / maxLength);
};

export interface SimilarityFactors {
  exact: boolean;
  levenshtein: number;
  containment: number;
  length: number;
  prefix?: number;
  suffix?: number;
  commonPrefixLength?: number;
  commonSuffixLength?: number;
}

export interface SimilarityResult {
  score: number;
  factors: SimilarityFactors;
}

/**
 * Enhanced similarity calculation with multiple factors
 * @param sku1 - First SKU
 * @param sku2 - Second SKU
 * @returns Detailed similarity analysis
 */
export const calculateEnhancedSimilarity = (sku1: string, sku2: string): SimilarityResult => {
  if (!sku1 || !sku2) return { score: 0, factors: { exact: false, levenshtein: 0, containment: 0, length: 0 } };

  const normalizedSku1 = sku1.toLowerCase().trim();
  const normalizedSku2 = sku2.toLowerCase().trim();

  // Exact match
  if (normalizedSku1 === normalizedSku2) {
    return {
      score: 1,
      factors: { exact: true, levenshtein: 1, containment: 1, length: 1 },
    };
  }

  // Levenshtein-based similarity
  const levenshteinScore = calculateSimilarityScore(
    normalizedSku1,
    normalizedSku2
  );

  // Containment similarity (one contains the other)
  const containmentScore = Math.max(
    normalizedSku1.includes(normalizedSku2)
      ? normalizedSku2.length / normalizedSku1.length
      : 0,
    normalizedSku2.includes(normalizedSku1)
      ? normalizedSku1.length / normalizedSku2.length
      : 0
  );

  // Length similarity
  const lengthScore =
    Math.min(normalizedSku1.length, normalizedSku2.length) /
    Math.max(normalizedSku1.length, normalizedSku2.length);

  // Common prefix/suffix similarity
  let commonPrefixLength = 0;
  let commonSuffixLength = 0;

  // Calculate common prefix
  for (
    let i = 0;
    i < Math.min(normalizedSku1.length, normalizedSku2.length);
    i++
  ) {
    if (normalizedSku1[i] === normalizedSku2[i]) {
      commonPrefixLength++;
    } else {
      break;
    }
  }

  // Calculate common suffix
  for (
    let i = 1;
    i <= Math.min(normalizedSku1.length, normalizedSku2.length);
    i++
  ) {
    if (
      normalizedSku1[normalizedSku1.length - i] ===
      normalizedSku2[normalizedSku2.length - i]
    ) {
      commonSuffixLength++;
    } else {
      break;
    }
  }

  const prefixScore =
    commonPrefixLength / Math.max(normalizedSku1.length, normalizedSku2.length);
  const suffixScore =
    commonSuffixLength / Math.max(normalizedSku1.length, normalizedSku2.length);

  // Weighted final score
  const finalScore =
    levenshteinScore * 0.4 + // 40% Levenshtein
    containmentScore * 0.3 + // 30% Containment
    lengthScore * 0.1 + // 10% Length
    prefixScore * 0.1 + // 10% Prefix
    suffixScore * 0.1; // 10% Suffix

  return {
    score: Math.min(1, Math.max(0, finalScore)),
    factors: {
      exact: false,
      levenshtein: levenshteinScore,
      containment: containmentScore,
      length: lengthScore,
      prefix: prefixScore,
      suffix: suffixScore,
      commonPrefixLength,
      commonSuffixLength,
    },
  };
};
