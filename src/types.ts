export type SeatStatus = 'available' | 'reserved' | 'sold' | 'held';

export interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: number;
  status: SeatStatus;
}

export interface Row {
  index: number;
  seats: Seat[];
}

export interface Section {
  id: string;
  label: string;
  transform: { x: number; y: number; scale: number };
  rows: Row[];
}

export interface Stage {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface Venue {
  venueId: string;
  name: string;
  map: { width: number; height: number };
  stage?: Stage;
  sections: Section[];
}

export interface PlacedSeat {
  id: string;
  sectionId: string;
  sectionLabel: string;
  row: number;
  col: number;
  x: number;
  y: number;
  priceTier: number;
  price: number;
  status: SeatStatus;
}
