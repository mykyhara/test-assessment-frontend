import type { PlacedSeat } from '../venue/types';
import { formatPrice, STATUS_LABELS } from '../venue/format';

export function SeatDetails({ seat }: { seat: PlacedSeat | null }) {
  if (!seat) {
    return <p className="details muted">Select a seat to see its details.</p>;
  }

  return (
    <dl className="details">
      <div>
        <dt>Section</dt>
        <dd>{seat.sectionLabel}</dd>
      </div>
      <div>
        <dt>Row</dt>
        <dd>{seat.row}</dd>
      </div>
      <div>
        <dt>Seat</dt>
        <dd>{seat.col}</dd>
      </div>
      <div>
        <dt>Price</dt>
        <dd>{formatPrice(seat.price)}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{STATUS_LABELS[seat.status]}</dd>
      </div>
    </dl>
  );
}
