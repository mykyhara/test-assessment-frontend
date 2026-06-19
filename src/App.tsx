import { useEffect, useMemo, useState } from 'react';
import type { PlacedSeat, Venue } from './types';
import { loadVenue, placeSeats } from './venue';
import { useSelection } from './useSelection';
import { SeatingMap } from './SeatingMap';
import { SeatDetails } from './SeatDetails';
import { Summary } from './Summary';
import { Legend } from './Legend';
import { formatPrice, STATUS_LABELS } from './format';

export default function App() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useState(false);

  useEffect(() => {
    loadVenue().then(setVenue, (reason: unknown) =>
      setError(reason instanceof Error ? reason.message : 'Unknown error'),
    );
  }, []);

  const seats = useMemo(() => (venue ? placeSeats(venue) : []), [venue]);
  const seatsById = useMemo(() => new Map(seats.map((seat) => [seat.id, seat])), [seats]);
  const selection = useSelection(seatsById);

  const selectedSeats = useMemo(
    () =>
      selection.ids
        .map((id) => seatsById.get(id))
        .filter((seat): seat is PlacedSeat => Boolean(seat)),
    [selection.ids, seatsById],
  );
  const focusedSeat = focusedId ? (seatsById.get(focusedId) ?? null) : null;

  if (error) return <div className="state">Could not load the venue: {error}</div>;
  if (!venue) return <div className="state">Loading venue…</div>;

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>{venue.name}</h1>
          <p>{seats.length.toLocaleString()} seats</p>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={heatmap}
            onChange={(event) => setHeatmap(event.target.checked)}
          />
          Price heat-map
        </label>
      </header>

      <main className="app__main">
        <SeatingMap
          seats={seats}
          mapWidth={venue.map.width}
          mapHeight={venue.map.height}
          stage={venue.stage}
          selectedSeats={selectedSeats}
          focusedSeat={focusedSeat}
          heatmap={heatmap}
          onToggleSeat={selection.toggle}
          onFocusSeat={(seat) => setFocusedId(seat.id)}
        />

        <aside className="app__sidebar">
          <Legend heatmap={heatmap} />
          <section className="panel">
            <h2>Seat details</h2>
            <SeatDetails seat={focusedSeat} />
          </section>
          <Summary
            seats={selectedSeats}
            onRemove={selection.toggle}
            onClear={selection.clear}
            isFull={selection.isFull}
          />
        </aside>
      </main>

      <div className="sr-only" aria-live="polite">
        {focusedSeat
          ? `${focusedSeat.sectionLabel}, row ${focusedSeat.row}, seat ${focusedSeat.col}, ${formatPrice(focusedSeat.price)}, ${STATUS_LABELS[focusedSeat.status]}`
          : ''}
      </div>
    </div>
  );
}
