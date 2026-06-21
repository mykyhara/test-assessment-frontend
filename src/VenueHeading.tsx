import { use } from 'react';
import { countSeats, getVenue } from './venue/venue';

export function VenueHeading({ file }: { file: string }) {
  const venue = use(getVenue(file));
  return (
    <div className="heading">
      <h1>{venue.name}</h1>
      <p>{countSeats(venue).toLocaleString()} seats</p>
    </div>
  );
}
