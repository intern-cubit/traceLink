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
            if (Array.isArray(action.payload)) {
                state.trackers = action.payload;
                console.log(action.payload);
            } else {
                console.error("Payload is not an array:", action.payload);
            }
        },

        selectTracker: (state, action) => {
            state.selectedTrackerId = action.payload;
        },
        updateTrackerLocation: (state, action) => {
            const t = localStorage.getItem("trackers");
            if (t) {
                const trackers = JSON.parse(t);
                state.trackers = trackers;
            }
            const {
                deviceId,
                latitude,
                longitude,
                timestamp,
                status,
                battery,
                main,
                diff,
            } = action.payload;

            console.log(state.trackers); // Log the current state of trackers
            const trackerIndex = state.trackers.findIndex(
                (tracker) => tracker.tracker._id === deviceId
            );

            if (trackerIndex !== -1) {
                const updatedTrackers = state.trackers.map((tracker) => {
                    if (tracker.tracker._id === deviceId) {
                        console.log("hello"); // This will log when we are updating the correct tracker
                        return {
                            ...tracker,
                            latest: {
                                location: { latitude, longitude, timestamp },
                            },
                            status,
                            battery,
                            main,
                            timestamp,
                            diff,
                            location: { latitude, longitude },
                        };
                    }
                    return tracker; // If tracker doesn't match, return it unchanged
                });

                state.trackers = updatedTrackers; // Update the state with the new tracker array

                // Log updated trackers after update
                console.log("Trackers after update:", state.trackers);
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
