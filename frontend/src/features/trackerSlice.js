import { createSlice } from "@reduxjs/toolkit";

const trackerSlice = createSlice({
    name: "tracker",
    initialState: {
        trackers: [],
        selectedTrackerId: null,
        loading: false,
        error: null,
    },

    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setTrackers: (state, action) => {
            state.trackers = action.payload;
        },
        selectTracker: (state, action) => {
            state.selectedTrackerId = action.payload;
        },
        updateTrackerLocation: (state, action) => {
            console.log('[trackerSlice] updateTrackerLocation payload:', action.payload);
            console.log('[trackerSlice] before update, trackers:', state.trackers);
            const { deviceId, latitude, longitude, timestamp, status } =
                action.payload;

            const trackerIndex = state.trackers.findIndex((t) => {
                t.tracker._id === deviceId;
            });

            if (trackerIndex !== -1) {
                const tracker = state.trackers[trackerIndex];

                tracker.latest = {
                    ...tracker.latest,
                    location: {
                        latitude,
                        longitude,
                        timestamp,
                    },
                };

                tracker.status = status;
                state.trackers[trackerIndex] = tracker;
            } else {
                console.warn(`Tracker with ID ${deviceId} not found in state.`);
            }
        },
    },
});

export const {
    setLoading,
    setError,
    setTrackers,
    selectTracker,
    updateTrackerLocation,
} = trackerSlice.actions;

export default trackerSlice.reducer;
