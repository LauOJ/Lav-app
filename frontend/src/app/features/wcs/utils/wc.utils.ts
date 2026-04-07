export function wcCleanlinessStars(value: number | null): string {
  if (value == null) return 'Sin datos';
  const rounded = Math.min(5, Math.max(0, Math.round(value)));
  return '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(0, 5 - rounded);
}

export function normalizeWcScore(score: number | null): number | null {
  if (score == null) return null;
  // Some API responses can arrive as 0..100 instead of 0..1.
  const normalized = score > 1 ? score / 100 : score;
  return Math.min(1, Math.max(0, normalized));
}

export function wcScorePercentage(score: number | null): string {
  const normalized = normalizeWcScore(score);
  if (normalized == null) return 'Sin datos';
  return `${Math.round(normalized * 100)}%`;
}

export function wcHasLimitedInfo(reviewsCount: number): boolean {
  return reviewsCount < 3;
}

export function wcDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const radius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
