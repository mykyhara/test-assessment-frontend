import type { PlacedSeat, SeatStatus } from './types';

export interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const SEAT_HALF = 3.5;

export const STATUS_COLORS: Record<SeatStatus, string> = {
  available: '#2f9e44',
  reserved: '#f08c00',
  held: '#1971c2',
  sold: '#ced4da',
};

export const TIER_COLORS = ['#1971c2', '#15aabf', '#82c91e', '#f59f00'];
export const SELECTED_COLOR = '#d6336c';
const FOCUS_COLOR = '#212529';

export function colorForSeat(seat: PlacedSeat, heatmap: boolean): string {
  if (heatmap) return TIER_COLORS[(seat.priceTier - 1) % TIER_COLORS.length];
  return STATUS_COLORS[seat.status];
}

export function screenToWorld(px: number, py: number, t: Transform) {
  return { x: (px - t.offsetX) / t.scale, y: (py - t.offsetY) / t.scale };
}

function visibleBounds(t: Transform, width: number, height: number) {
  return {
    minX: -t.offsetX / t.scale,
    minY: -t.offsetY / t.scale,
    maxX: (width - t.offsetX) / t.scale,
    maxY: (height - t.offsetY) / t.scale,
  };
}

export function hitTest(seats: PlacedSeat[], wx: number, wy: number): PlacedSeat | null {
  const reach = SEAT_HALF * 2;
  let closest: PlacedSeat | null = null;
  let closestDistance = Infinity;
  for (const seat of seats) {
    const dx = wx - seat.x;
    const dy = wy - seat.y;
    if (Math.abs(dx) > reach || Math.abs(dy) > reach) continue;
    const distance = dx * dx + dy * dy;
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = seat;
    }
  }
  return closest;
}

interface Scene {
  ctx: CanvasRenderingContext2D;
  seats: PlacedSeat[];
  transform: Transform;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
  selectedSeats: PlacedSeat[];
  focusedSeat: PlacedSeat | null;
  heatmap: boolean;
}

export function drawScene(scene: Scene): void {
  const { ctx, seats, transform, cssWidth, cssHeight, dpr, selectedSeats, focusedSeat, heatmap } =
    scene;
  const size = SEAT_HALF * 2;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.save();
  ctx.translate(transform.offsetX, transform.offsetY);
  ctx.scale(transform.scale, transform.scale);

  const bounds = visibleBounds(transform, cssWidth, cssHeight);
  const groups = new Map<string, PlacedSeat[]>();
  for (const seat of seats) {
    if (
      seat.x < bounds.minX - size ||
      seat.x > bounds.maxX + size ||
      seat.y < bounds.minY - size ||
      seat.y > bounds.maxY + size
    ) {
      continue;
    }
    const color = colorForSeat(seat, heatmap);
    const group = groups.get(color);
    if (group) group.push(seat);
    else groups.set(color, [seat]);
  }

  for (const [color, group] of groups) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (const seat of group) ctx.rect(seat.x - SEAT_HALF, seat.y - SEAT_HALF, size, size);
    ctx.fill();
  }

  if (selectedSeats.length > 0) {
    ctx.fillStyle = SELECTED_COLOR;
    ctx.beginPath();
    for (const seat of selectedSeats) ctx.rect(seat.x - SEAT_HALF, seat.y - SEAT_HALF, size, size);
    ctx.fill();
  }

  if (focusedSeat) {
    ctx.lineWidth = 2 / transform.scale;
    ctx.strokeStyle = FOCUS_COLOR;
    ctx.strokeRect(
      focusedSeat.x - SEAT_HALF - 1,
      focusedSeat.y - SEAT_HALF - 1,
      size + 2,
      size + 2,
    );
  }

  ctx.restore();
}
