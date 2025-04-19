import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectAllTrackers } from "../selectors/trackerSelectors.js";
import { selectTracker } from "../features/trackerSlice";

export default function DeviceSwitcher() {
    const dispatch = useDispatch();
    const trackers = useSelector(state => state.tracker.trackers);
    const selected = useSelector(state => state.tracker.selectedTrackerId);

    return (
        <div className="mb-4">
            <label htmlFor="device-select" className="block text-sm font-medium text-gray-700">
                Select Device
            </label>
            <select
                id="device-select"
                value={selected || ""}
                onChange={(e) => dispatch(selectTracker(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
                <option value="" disabled>Select a device…</option>
                {trackers.map(({ tracker }) => (
                    <option key={tracker.deviceId} value={tracker.deviceId}>
                        {tracker.deviceName || tracker.deviceId}
                    </option>
                ))}
            </select>
        </div>
    );
}
