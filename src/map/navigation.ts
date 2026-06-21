import type { PlacedSeat } from '../venue/types';

export type Direction = 'up' | 'down' | 'left' | 'right';

interface Position {
  section: string;
  row: number;
  col: number;
}

export class SeatNavigator {
  private readonly grid = new Map<string, PlacedSeat[][]>();
  private readonly position = new Map<string, Position>();
  private readonly sectionOrder: string[] = [];

  constructor(seats: PlacedSeat[]) {
    const bySection = new Map<string, Map<number, PlacedSeat[]>>();
    for (const seat of seats) {
      let rows = bySection.get(seat.sectionId);
      if (!rows) {
        rows = new Map();
        bySection.set(seat.sectionId, rows);
      }
      const row = rows.get(seat.row);
      if (row) row.push(seat);
      else rows.set(seat.row, [seat]);
    }

    const centers: { id: string; x: number; y: number }[] = [];
    for (const [sectionId, rowsMap] of bySection) {
      const rows = [...rowsMap.keys()]
        .sort((a, b) => a - b)
        .map((index) =>
          rowsMap
            .get(index)!
            .slice()
            .sort((a, b) => a.col - b.col),
        );
      this.grid.set(sectionId, rows);
      rows.forEach((row, r) =>
        row.forEach((seat, c) =>
          this.position.set(seat.id, { section: sectionId, row: r, col: c }),
        ),
      );

      let sx = 0;
      let sy = 0;
      let count = 0;
      for (const row of rows) {
        for (const seat of row) {
          sx += seat.x;
          sy += seat.y;
          count += 1;
        }
      }
      centers.push({ id: sectionId, x: sx / count, y: sy / count });
    }

    const originX = centers.reduce((t, c) => t + c.x, 0) / (centers.length || 1);
    const originY = centers.reduce((t, c) => t + c.y, 0) / (centers.length || 1);
    centers.sort(
      (a, b) => Math.atan2(a.y - originY, a.x - originX) - Math.atan2(b.y - originY, b.x - originX),
    );
    this.sectionOrder = centers.map((c) => c.id);
  }

  first(): PlacedSeat | null {
    const section = this.sectionOrder[0];
    return section ? this.grid.get(section)![0][0] : null;
  }

  next(currentId: string, direction: Direction): PlacedSeat | null {
    const pos = this.position.get(currentId);
    if (!pos) return this.first();
    const rows = this.grid.get(pos.section)!;
    const row = rows[pos.row];

    if (direction === 'left') return row[Math.max(0, pos.col - 1)];
    if (direction === 'right') return row[Math.min(row.length - 1, pos.col + 1)];

    const targetRow = direction === 'up' ? pos.row - 1 : pos.row + 1;
    if (targetRow < 0 || targetRow >= rows.length) return row[pos.col];
    const moved = rows[targetRow];
    return moved[Math.min(pos.col, moved.length - 1)];
  }

  section(currentId: string, delta: number): PlacedSeat | null {
    const pos = this.position.get(currentId);
    const index = pos ? this.sectionOrder.indexOf(pos.section) : -1;
    if (index === -1) return this.first();
    const count = this.sectionOrder.length;
    return this.grid.get(this.sectionOrder[(index + delta + count) % count])![0][0];
  }
}
