export interface VenueOption {
  id: string;
  label: string;
  file: string;
}

interface VenueSwitcherProps {
  venues: VenueOption[];
  value: string;
  onChange: (id: string) => void;
}

export function VenueSwitcher({ venues, value, onChange }: VenueSwitcherProps) {
  return (
    <div className="switcher" role="radiogroup" aria-label="Venue size">
      {venues.map((venue) => (
        <label key={venue.id} className={venue.id === value ? 'active' : undefined}>
          <input
            type="radio"
            name="venue-size"
            value={venue.id}
            checked={venue.id === value}
            onChange={() => onChange(venue.id)}
          />
          {venue.label}
        </label>
      ))}
    </div>
  );
}
