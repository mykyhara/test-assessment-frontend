import type { PlacedSeat } from './types';
import { MAX_SEATS } from './selection';
import { formatPrice } from './format';

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
      <header className="summary__header">
        <h2>Your seats</h2>
        <span>
          {seats.length} / {MAX_SEATS}
        </span>
      </header>

      {seats.length === 0 ? (
        <p className="summary__empty">Pick up to {MAX_SEATS} available seats to get started.</p>
      ) : (
        <ul className="summary__list">
          {seats.map((seat) => (
            <li key={seat.id}>
              <span>
                {seat.sectionLabel} · Row {seat.row} · Seat {seat.col}
              </span>
              <span className="summary__price">{formatPrice(seat.price)}</span>
              <button
                type="button"
                onClick={() => onRemove(seat)}
                aria-label={`Remove seat ${seat.id}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="summary__footer">
        <div className="summary__subtotal">
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <button
          type="button"
          className="summary__clear"
          onClick={onClear}
          disabled={seats.length === 0}
        >
          Clear all
        </button>
      </footer>

      {isFull && (
        <p className="summary__note" role="status">
          You have reached the {MAX_SEATS}-seat limit.
        </p>
      )}
    </section>
  );
}
