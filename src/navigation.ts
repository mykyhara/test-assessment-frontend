import type { PlacedSeat } from './types';

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
      this.sectionOrder.push(sectionId);
      rows.forEach((row, r) =>
        row.forEach((seat, c) =>
          this.position.set(seat.id, { section: sectionId, row: r, col: c }),
        ),
      );
    }
    this.sectionOrder.sort();
  }

  first(): PlacedSeat | null {
    const section = this.sectionOrder[0];
    return section ? this.grid.get(section)![0][0] : null;
  }

  next(currentId: string, direction: Direction): PlacedSeat | null {
    const pos = this.position.get(currentId);
    if (!pos) return null;
    const rows = this.grid.get(pos.section)!;

    if (direction === 'left') return rows[pos.row][Math.max(0, pos.col - 1)];
    if (direction === 'right')
      return rows[pos.row][Math.min(rows[pos.row].length - 1, pos.col + 1)];

    const targetRow = direction === 'up' ? pos.row - 1 : pos.row + 1;
    if (targetRow < 0 || targetRow >= rows.length) return rows[pos.row][pos.col];
    const row = rows[targetRow];
    return row[Math.min(pos.col, row.length - 1)];
  }
}
