import type { PlacedSeat, SeatStatus, Stage } from '../venue/types';

export interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const SEAT_HALF = 3;
const SEAT_FILL = 0.85;
const TAU = Math.PI * 2;

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

export function fitTransform(
  width: number,
  height: number,
  mapWidth: number,
  mapHeight: number,
): Transform {
  const scale = Math.min(width / mapWidth, height / mapHeight) * 0.95;
  return {
    scale,
    offsetX: (width - mapWidth * scale) / 2,
    offsetY: (height - mapHeight * scale) / 2,
  };
}

function visibleBounds(t: Transform, width: number, height: number) {
  return {
    minX: -t.offsetX / t.scale,
    minY: -t.offsetY / t.scale,
    maxX: (width - t.offsetX) / t.scale,
    maxY: (height - t.offsetY) / t.scale,
  };
}

// Markers have a fixed world radius, but the densest venues pack inner-row seats
// closer than the default diameter; cap the radius at what the tightest row allows.
export function fitSeatRadius(seats: PlacedSeat[]): number {
  let minSpacing = Infinity;
  for (let i = 1; i < seats.length; i++) {
    const prev = seats[i - 1];
    const seat = seats[i];
    if (seat.sectionId !== prev.sectionId || seat.row !== prev.row) continue;
    minSpacing = Math.min(minSpacing, Math.hypot(seat.x - prev.x, seat.y - prev.y));
  }
  return Number.isFinite(minSpacing)
    ? Math.min(SEAT_HALF, (minSpacing / 2) * SEAT_FILL)
    : SEAT_HALF;
}

export function hitTest(
  seats: PlacedSeat[],
  wx: number,
  wy: number,
  radius: number,
): PlacedSeat | null {
  const reach = radius * 2;
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
  seatRadius: number;
  transform: Transform;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
  selectedSeats: PlacedSeat[];
  focusedSeat: PlacedSeat | null;
  heatmap: boolean;
  stage?: Stage;
}

export function drawScene(scene: Scene): void {
  const {
    ctx,
    seats,
    seatRadius,
    transform,
    cssWidth,
    cssHeight,
    dpr,
    selectedSeats,
    focusedSeat,
    heatmap,
  } = scene;
  const margin = seatRadius * 2;
  const addCircle = (seat: PlacedSeat) => {
    ctx.moveTo(seat.x + seatRadius, seat.y);
    ctx.arc(seat.x, seat.y, seatRadius, 0, TAU);
  };

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.save();
  ctx.translate(transform.offsetX, transform.offsetY);
  ctx.scale(transform.scale, transform.scale);

  if (scene.stage) {
    const { x, y, width, height, label } = scene.stage;
    ctx.fillStyle = '#343a40';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#ced4da';
    ctx.font = `bold ${Math.min(width, height) * 0.22}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + width / 2, y + height / 2);
  }

  const bounds = visibleBounds(transform, cssWidth, cssHeight);
  const groups = new Map<string, PlacedSeat[]>();
  for (const seat of seats) {
    if (
      seat.x < bounds.minX - margin ||
      seat.x > bounds.maxX + margin ||
      seat.y < bounds.minY - margin ||
      seat.y > bounds.maxY + margin
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
    for (const seat of group) addCircle(seat);
    ctx.fill();
  }

  if (selectedSeats.length > 0) {
    ctx.fillStyle = SELECTED_COLOR;
    ctx.beginPath();
    for (const seat of selectedSeats) addCircle(seat);
    ctx.fill();
  }

  if (focusedSeat) {
    ctx.lineWidth = 2 / transform.scale;
    ctx.strokeStyle = FOCUS_COLOR;
    ctx.beginPath();
    ctx.arc(focusedSeat.x, focusedSeat.y, seatRadius + 2, 0, TAU);
    ctx.stroke();
  }

  ctx.restore();
}
