import type { SeatStatus } from './types';
import { STATUS_LABELS } from './format';
import { SELECTED_COLOR, STATUS_COLORS, TIER_COLORS } from './render';

const STATUSES: SeatStatus[] = ['available', 'reserved', 'held', 'sold'];

export function Legend({ heatmap }: { heatmap: boolean }) {
  const items = heatmap
    ? TIER_COLORS.map((color, index) => ({ color, label: `Tier ${index + 1}` }))
    : STATUSES.map((status) => ({ color: STATUS_COLORS[status], label: STATUS_LABELS[status] }));

  return (
    <ul className="legend" aria-label="Seat legend">
      {items.map((item) => (
        <li key={item.label}>
          <span className="legend__dot" style={{ backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
      {!heatmap && (
        <li>
          <span className="legend__dot" style={{ backgroundColor: SELECTED_COLOR }} />
          Selected
        </li>
      )}
    </ul>
  );
}
