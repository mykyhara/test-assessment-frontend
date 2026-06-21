import type { PlacedSeat } from '../venue/types';

export const MAX_SEATS = 8;
const STORAGE_PREFIX = 'seating-map.selection';

export const storageKey = (venueId: string) => `${STORAGE_PREFIX}.${venueId}`;

export function toggleSeat(selected: string[], seat: PlacedSeat): string[] {
  if (selected.includes(seat.id)) return selected.filter((id) => id !== seat.id);
  if (seat.status !== 'available' || selected.length >= MAX_SEATS) return selected;
  return [...selected, seat.id];
}

export function loadSelection(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function saveSelection(key: string, ids: string[]): void {
  if (ids.length === 0) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(ids));
}
