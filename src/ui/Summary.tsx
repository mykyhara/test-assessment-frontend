import type { PlacedSeat } from '../venue/types';
import { MAX_SEATS } from '../selection/selection';
import { formatPrice } from '../venue/format';

interface SummaryProps {
  seats: PlacedSeat[];
  onRemove: (seat: PlacedSeat) => void;
  onClear: () => void;
  isFull: boolean;
}

export function Summary({ seats, onRemove, onClear, isFull }: SummaryProps) {
  const subtotal = seats.reduce((total, seat) => total + seat.price, 0);

  return (
    <section className="summary" aria-label="Selected seats">
      <header>
        <h2>Your seats</h2>
        <span>
          {seats.length} / {MAX_SEATS}
        </span>
      </header>

      {seats.length === 0 ? (
        <p className="muted">Pick up to {MAX_SEATS} available seats to get started.</p>
      ) : (
        <ul className="tickets">
          {seats.map((seat) => (
            <li key={seat.id}>
              <span>
                {seat.sectionLabel} · Row {seat.row} · Seat {seat.col}
              </span>
              <span className="price">{formatPrice(seat.price)}</span>
              <button
                type="button"
                onClick={() => onRemove(seat)}
                aria-label={`Remove ${seat.sectionLabel}, row ${seat.row}, seat ${seat.col}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer>
        <div className="subtotal">
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <button type="button" className="clear" onClick={onClear} disabled={seats.length === 0}>
          Clear all
        </button>
      </footer>

      {isFull && (
        <p className="note" role="status">
          You have reached the {MAX_SEATS}-seat limit.
        </p>
      )}
    </section>
  );
}
