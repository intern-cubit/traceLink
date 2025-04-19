import { createSlice } from "@reduxjs/toolkit";

const trackerSlice = createSlice({
    name: "tracker",
    initialState: {
        trackers: [], // array of { tracker, latest, status }
        selectedTrackerId: null, // deviceId of the currently selected tracker
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
            const { deviceId, latitude, longitude, timestamp, main, battery } =
                action.payload;
            const entry = state.trackers.find(
                (t) => t.tracker.deviceId === deviceId
            );
            if (entry) {
                entry.latest = {
                    latitude,
                    longitude,
                    timestamp,
                    main,
                    battery,
                };
                const diff = Date.now() - new Date(timestamp).getTime();
                entry.status = diff <= 60000 ? "online" : "offline";
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
