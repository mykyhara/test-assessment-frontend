import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Summary } from './Summary';
import type { PlacedSeat } from './types';

const seat = (id: string, price: number): PlacedSeat => ({
  id,
  sectionId: 'A',
  sectionLabel: 'Section A',
  row: 1,
  col: Number(id.slice(-1)),
  x: 0,
  y: 0,
  priceTier: 1,
  price,
  status: 'available',
});

const noop = () => {};

describe('Summary', () => {
  it('shows an empty state when nothing is selected', () => {
    render(<Summary seats={[]} onRemove={noop} onClear={noop} isFull={false} />);
    expect(screen.getByText(/pick up to 8/i)).toBeInTheDocument();
  });

  it('lists seats and totals the subtotal', () => {
    render(
      <Summary
        seats={[seat('A-1-1', 250), seat('A-1-2', 180)]}
        onRemove={noop}
        onClear={noop}
        isFull={false}
      />,
    );
    expect(screen.getByText('$430.00')).toBeInTheDocument();
  });

  it('calls onRemove for the chosen seat', async () => {
    const onRemove = vi.fn();
    render(
      <Summary seats={[seat('A-1-1', 250)]} onRemove={onRemove} onClear={noop} isFull={false} />,
    );
    await userEvent.click(screen.getByLabelText('Remove seat A-1-1'));
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ id: 'A-1-1' }));
  });
});
