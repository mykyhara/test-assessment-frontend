import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PlacedSeat } from './types';
import { loadSelection, MAX_SEATS, saveSelection, toggleSeat } from './selection';

export function useSelection(seatsById: Map<string, PlacedSeat>) {
  const [ids, setIds] = useState<string[]>(loadSelection);

  const valid = useMemo(
    () =>
      seatsById.size === 0 ? ids : ids.filter((id) => seatsById.get(id)?.status === 'available'),
    [ids, seatsById],
  );

  useEffect(() => {
    saveSelection(valid);
  }, [valid]);

  const toggle = useCallback(
    (seat: PlacedSeat) => setIds((current) => toggleSeat(current, seat)),
    [],
  );
  const clear = useCallback(() => setIds([]), []);

  return { ids: valid, toggle, clear, isFull: valid.length >= MAX_SEATS };
}
