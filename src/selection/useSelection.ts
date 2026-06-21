import { useEffect, useState } from 'react';
import type { PlacedSeat } from '../venue/types';
import { loadSelection, MAX_SEATS, saveSelection, storageKey, toggleSeat } from './selection';

export function useSelection(seatsById: Map<string, PlacedSeat>, venueId: string) {
  const key = storageKey(venueId);
  const [ids, setIds] = useState<string[]>(() => loadSelection(key));

  const valid =
    seatsById.size === 0 ? ids : ids.filter((id) => seatsById.get(id)?.status === 'available');

  useEffect(() => {
    saveSelection(key, valid);
  }, [key, valid]);

  return {
    ids: valid,
    isFull: valid.length >= MAX_SEATS,
    toggle: (seat: PlacedSeat) => setIds((current) => toggleSeat(current, seat)),
    clear: () => setIds([]),
  };
}
