/**
 * Returns color for a score value using 4-tier system:
 * 85+  → Green
 * 70-85 → Yellow
 * 55-70 → Orange
 * <55  → Red
 */
export function getScoreColor(score: number | null | undefined): string {
  if (score == null) return '#9CA3AF';
  if (score >= 85) return '#4CAF50';
  if (score >= 70) return '#FFC107';
  if (score >= 55) return '#FF9800';
  return '#F44336';
}

export function getScoreBgColor(score: number | null | undefined): string {
  if (score == null) return '#9CA3AF20';
  if (score >= 85) return '#4CAF5020';
  if (score >= 70) return '#FFC10720';
  if (score >= 55) return '#FF980020';
  return '#F4433620';
}
