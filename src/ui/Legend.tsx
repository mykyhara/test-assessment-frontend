import type { SeatStatus } from '../venue/types';
import { STATUS_LABELS } from '../venue/format';
import { SELECTED_COLOR, STATUS_COLORS, TIER_COLORS } from '../map/render';

const STATUSES: SeatStatus[] = ['available', 'reserved', 'held', 'sold'];

export function Legend({ heatmap }: { heatmap: boolean }) {
  const items = heatmap
    ? TIER_COLORS.map((color, index) => ({ color, label: `Tier ${index + 1}` }))
    : STATUSES.map((status) => ({ color: STATUS_COLORS[status], label: STATUS_LABELS[status] }));

  return (
    <ul className="legend" aria-label="Seat legend">
      {items.map((item) => (
        <li key={item.label}>
          <span className="dot" style={{ backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
      {!heatmap && (
        <li>
          <span className="dot" style={{ backgroundColor: SELECTED_COLOR }} />
          Selected
        </li>
      )}
    </ul>
  );
}
