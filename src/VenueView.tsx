import { use, useState } from 'react';
import type { PlacedSeat } from './venue/types';
import { getVenue, placeSeats } from './venue/venue';
import { formatPrice, STATUS_LABELS } from './venue/format';
import { useSelection } from './selection/useSelection';
import { SeatingMap } from './map/SeatingMap';
import { Legend } from './ui/Legend';
import { SeatDetails } from './ui/SeatDetails';
import { Summary } from './ui/Summary';

interface VenueViewProps {
  file: string;
  venueId: string;
  heatmap: boolean;
  busy: boolean;
}

export function VenueView({ file, venueId, heatmap, busy }: VenueViewProps) {
  const venue = use(getVenue(file));
  const seats = placeSeats(venue);
  const seatsById = new Map(seats.map((seat) => [seat.id, seat]));

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const selection = useSelection(seatsById, venueId);

  const selectedSeats = selection.ids
    .map((id) => seatsById.get(id))
    .filter((seat): seat is PlacedSeat => seat !== undefined);
  const focusedSeat = focusedId ? (seatsById.get(focusedId) ?? null) : null;

  return (
    <main className="main" aria-busy={busy}>
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

      <aside className="sidebar">
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

      <div className="sr-only" aria-live="polite">
        {focusedSeat
          ? `${focusedSeat.sectionLabel}, row ${focusedSeat.row}, seat ${focusedSeat.col}, ${formatPrice(focusedSeat.price)}, ${STATUS_LABELS[focusedSeat.status]}`
          : ''}
      </div>
    </main>
  );
}
