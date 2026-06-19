import type { PlacedSeat } from './types';

export const MAX_SEATS = 8;
const STORAGE_KEY = 'seating-map.selection';

export function toggleSeat(selected: string[], seat: PlacedSeat): string[] {
  if (selected.includes(seat.id)) return selected.filter((id) => id !== seat.id);
  if (seat.status !== 'available' || selected.length >= MAX_SEATS) return selected;
  return [...selected, seat.id];
}

export function loadSelection(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function saveSelection(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
