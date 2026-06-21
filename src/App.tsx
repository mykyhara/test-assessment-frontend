import { Suspense, useDeferredValue, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { VenueHeading } from './VenueHeading';
import { VenueView } from './VenueView';
import { VenueSwitcher, type VenueOption } from './ui/VenueSwitcher';

const venues: VenueOption[] = [
  { id: '1k', label: '1k', file: '/venues/arena-1k.json' },
  { id: '2k', label: '2k', file: '/venues/arena-2k.json' },
  { id: '5k', label: '5k', file: '/venues/arena-5k.json' },
  { id: '10k', label: '10k', file: '/venues/arena-10k.json' },
  { id: '15k', label: '15k', file: '/venue.json' },
];

export default function App() {
  const [venueId, setVenueId] = useState('5k');
  const [heatmap, setHeatmap] = useState(false);

  const loadingId = useDeferredValue(venueId);
  const file = venues.find((venue) => venue.id === loadingId)!.file;
  const busy = venueId !== loadingId;

  return (
    <div className="app">
      <header className="header">
        <Suspense fallback={<div className="heading">…</div>}>
          <ErrorBoundary
            key={loadingId}
            fallback={<div className="heading">Venue unavailable</div>}
          >
            <VenueHeading file={file} />
          </ErrorBoundary>
        </Suspense>
        <div className="controls">
          <VenueSwitcher venues={venues} value={venueId} onChange={setVenueId} />
          <label className="toggle">
            <input
              type="checkbox"
              checked={heatmap}
              onChange={(event) => setHeatmap(event.target.checked)}
            />
            Price heat-map
          </label>
        </div>
      </header>

      <ErrorBoundary key={loadingId} fallback={<p className="state">Could not load this venue.</p>}>
        <Suspense fallback={<p className="state">Loading venue…</p>}>
          <VenueView
            key={loadingId}
            file={file}
            venueId={loadingId}
            heatmap={heatmap}
            busy={busy}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
