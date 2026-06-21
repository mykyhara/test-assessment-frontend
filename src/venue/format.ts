import type { SeatStatus } from './types';

export const formatPrice = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const STATUS_LABELS: Record<SeatStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  held: 'On hold',
};
