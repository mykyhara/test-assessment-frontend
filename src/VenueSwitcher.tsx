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
    <fieldset className="venue-switcher">
      <legend className="sr-only">Venue size</legend>
      {venues.map((venue) => (
        <label
          key={venue.id}
          className={`venue-switcher__option${venue.id === value ? ' is-active' : ''}`}
        >
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
    </fieldset>
  );
}
