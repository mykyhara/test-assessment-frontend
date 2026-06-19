import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { PlacedSeat, Stage } from './types';
import { SeatNavigator, type Direction } from './navigation';
import { drawScene, hitTest, screenToWorld, type Transform } from './render';

interface SeatingMapProps {
  seats: PlacedSeat[];
  mapWidth: number;
  mapHeight: number;
  stage?: Stage;
  selectedSeats: PlacedSeat[];
  focusedSeat: PlacedSeat | null;
  heatmap: boolean;
  onToggleSeat: (seat: PlacedSeat) => void;
  onFocusSeat: (seat: PlacedSeat) => void;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 12;
const TAP_THRESHOLD = 5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const distance = (a: PointerState, b: PointerState) => Math.hypot(a.x - b.x, a.y - b.y);

interface PointerState {
  x: number;
  y: number;
}

const ARROWS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

export function SeatingMap({
  seats,
  mapWidth,
  mapHeight,
  stage,
  selectedSeats,
  focusedSeat,
  heatmap,
  onToggleSeat,
  onFocusSeat,
}: SeatingMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transformRef = useRef<Transform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const frameRef = useRef<number | null>(null);
  const fittedRef = useRef(false);

  const pointersRef = useRef(new Map<number, PointerState>());
  const gestureRef = useRef({ moved: 0, lastX: 0, lastY: 0, pinchDistance: 0, pinchScale: 1 });

  const seatNavigator = useMemo(() => new SeatNavigator(seats), [seats]);

  const drawRef = useRef<() => void>(() => {});
  useEffect(() => {
    drawRef.current = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const { width, height, dpr } = sizeRef.current;
      drawScene({
        ctx,
        seats,
        transform: transformRef.current,
        cssWidth: width,
        cssHeight: height,
        dpr,
        selectedSeats,
        focusedSeat,
        heatmap,
        stage,
      });
    };
  });

  const scheduleDraw = useCallback(() => {
    if (frameRef.current != null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      drawRef.current();
    });
  }, []);

  const fitToView = useCallback(() => {
    const { width, height } = sizeRef.current;
    if (!width || !height) return;
    const scale = Math.min(width / mapWidth, height / mapHeight) * 0.95;
    transformRef.current = {
      scale,
      offsetX: (width - mapWidth * scale) / 2,
      offsetY: (height - mapHeight * scale) / 2,
    };
    scheduleDraw();
  }, [mapWidth, mapHeight, scheduleDraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { width, height, dpr };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (!fittedRef.current) {
        fittedRef.current = true;
        fitToView();
      } else {
        scheduleDraw();
      }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [fitToView, scheduleDraw]);

  useEffect(() => {
    scheduleDraw();
  });

  const zoomAt = useCallback(
    (px: number, py: number, factor: number) => {
      const t = transformRef.current;
      const scale = clamp(t.scale * factor, MIN_SCALE, MAX_SCALE);
      const world = screenToWorld(px, py, t);
      transformRef.current = {
        scale,
        offsetX: px - world.x * scale,
        offsetY: py - world.y * scale,
      };
      scheduleDraw();
    },
    [scheduleDraw],
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
      zoomAt(event.clientX - rect.left, event.clientY - rect.top, factor);
    },
    [zoomAt],
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointers = pointersRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const gesture = gestureRef.current;
    gesture.moved = 0;
    gesture.lastX = event.clientX;
    gesture.lastY = event.clientY;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      gesture.pinchDistance = distance(a, b);
      gesture.pinchScale = transformRef.current.scale;
    }
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const pointers = pointersRef.current;
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const gesture = gestureRef.current;

      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const rect = event.currentTarget.getBoundingClientRect();
        const midX = (a.x + b.x) / 2 - rect.left;
        const midY = (a.y + b.y) / 2 - rect.top;
        const factor = distance(a, b) / gesture.pinchDistance;
        zoomAt(midX, midY, (gesture.pinchScale * factor) / transformRef.current.scale);
        return;
      }

      const dx = event.clientX - gesture.lastX;
      const dy = event.clientY - gesture.lastY;
      gesture.moved += Math.abs(dx) + Math.abs(dy);
      gesture.lastX = event.clientX;
      gesture.lastY = event.clientY;
      const t = transformRef.current;
      transformRef.current = { ...t, offsetX: t.offsetX + dx, offsetY: t.offsetY + dy };
      scheduleDraw();
    },
    [scheduleDraw, zoomAt],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const pointers = pointersRef.current;
      const wasTap = pointers.size === 1 && gestureRef.current.moved < TAP_THRESHOLD;
      pointers.delete(event.pointerId);

      if (wasTap) {
        const rect = event.currentTarget.getBoundingClientRect();
        const world = screenToWorld(
          event.clientX - rect.left,
          event.clientY - rect.top,
          transformRef.current,
        );
        const seat = hitTest(seats, world.x, world.y);
        if (seat) {
          onFocusSeat(seat);
          onToggleSeat(seat);
        }
      }
    },
    [seats, onFocusSeat, onToggleSeat],
  );

  const keepFocusVisible = useCallback((seat: PlacedSeat) => {
    const t = transformRef.current;
    const { width, height } = sizeRef.current;
    const sx = seat.x * t.scale + t.offsetX;
    const sy = seat.y * t.scale + t.offsetY;
    const pad = 48;
    if (sx < pad || sx > width - pad || sy < pad || sy > height - pad) {
      transformRef.current = {
        ...t,
        offsetX: width / 2 - seat.x * t.scale,
        offsetY: height / 2 - seat.y * t.scale,
      };
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLCanvasElement>) => {
      const direction = ARROWS[event.key];
      if (direction) {
        event.preventDefault();
        const seat = focusedSeat
          ? seatNavigator.next(focusedSeat.id, direction)
          : seatNavigator.first();
        if (seat) {
          keepFocusVisible(seat);
          onFocusSeat(seat);
          scheduleDraw();
        }
        return;
      }
      if ((event.key === 'Enter' || event.key === ' ') && focusedSeat) {
        event.preventDefault();
        onToggleSeat(focusedSeat);
      }
    },
    [focusedSeat, seatNavigator, keepFocusVisible, onFocusSeat, onToggleSeat, scheduleDraw],
  );

  return (
    <div className="seating-map">
      <div className="seating-map__controls">
        <button
          type="button"
          onClick={() => zoomAt(sizeRef.current.width / 2, sizeRef.current.height / 2, 1.3)}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomAt(sizeRef.current.width / 2, sizeRef.current.height / 2, 1 / 1.3)}
          aria-label="Zoom out"
        >
          −
        </button>
        <button type="button" onClick={fitToView} aria-label="Reset view">
          Reset
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="seating-map__canvas"
        tabIndex={0}
        role="application"
        aria-label="Seating map. Use arrow keys to move between seats and Enter or Space to select. Scroll or pinch to zoom, drag to pan."
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
