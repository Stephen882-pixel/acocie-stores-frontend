// src/components/vendor/TrackingUpdateForm.jsx
import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { TRACKING_UPDATE_OPTIONS } from '../../utils/vendor';

/**
 * Props:
 *   tracking   — current OrderTracking record
 *   onSubmit   — async callback(changedFields) resolving to true on success
 *   submitting
 */
export default function TrackingUpdateForm({ tracking, onSubmit, submitting }) {
  const [currentLocation, setCurrentLocation] = useState('');
  const [trackingStatus, setTrackingStatus] = useState(
    TRACKING_UPDATE_OPTIONS.some((o) => o.value === tracking?.trackingStatus) ? tracking.trackingStatus : 'in_transit'
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const changes = {
    ...(currentLocation.trim() && { currentLocation: currentLocation.trim() }),
    ...(trackingStatus !== tracking?.trackingStatus && { trackingStatus }),
    ...(estimatedDelivery && { estimatedDelivery }),
  };
  const hasChanges = Object.keys(changes).length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;
    if (!(await onSubmit(changes))) return;
    setCurrentLocation('');
    setEstimatedDelivery('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Shipment status</label>
          <select value={trackingStatus} onChange={(e) => setTrackingStatus(e.target.value)} className="input-field">
            {TRACKING_UPDATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <Input
          label="Current location"
          placeholder={tracking?.currentLocation || 'e.g. Nairobi sorting hub'}
          value={currentLocation}
          onChange={(e) => setCurrentLocation(e.target.value)}
        />
      </div>
      <Input
        label="New estimated delivery (optional)"
        type="date"
        min={new Date().toISOString().slice(0, 10)}
        value={estimatedDelivery}
        onChange={(e) => setEstimatedDelivery(e.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit" variant="secondary" isLoading={submitting} disabled={!hasChanges}>Update tracking</Button>
      </div>
    </form>
  );
}
