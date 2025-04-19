import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    updateTrackerLocation,
    setError,
    setLoading,
} from "../features/trackerSlice";

/**
 * Custom hook to poll live tracker data every 5 seconds using fetch API.
 * Returns an array of [lat, lng] pairs representing the path.
 */
export function useLiveTracker() {
    const dispatch = useDispatch();
    const trackerId = localStorage.getItem("selectedTrackerId") || null;
    const [path, setPath] = useState([]);
    const intervalRef = useRef(null);
    const abortRef = useRef(null);

    useEffect(() => {
        if (!trackerId) {
            console.warn("No trackerId set. Skipping live tracker polling.");
            return;
        }

        const fetchLive = async () => {
            dispatch(setLoading(true));
            if (abortRef.current) {
                console.log("Aborting previous request...");
                abortRef.current.abort();
            }

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                console.log(`Fetching live location for tracker: ${trackerId}`);
                const response = await fetch(`http://localhost:5000/api/user/trackers/${trackerId}/live`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Failed to fetch live location"
                    );
                }

                const { latest, status } = await response.json();
                const { latitude, longitude, timestamp } = latest;

                console.log("Live location update:", latest, status);

                dispatch(
                    updateTrackerLocation({
                        deviceId: trackerId,
                        latitude,
                        longitude,
                        timestamp,
                        status,
                    })
                );

                setPath((prev) => [...prev, [latitude, longitude]]);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error fetching live data:", err.message);
                    dispatch(setError(err.message));
                }
            } finally {
                dispatch(setLoading(false));
                console.log("Finished live fetch cycle");
            }
        };

        fetchLive();
        intervalRef.current = setInterval(fetchLive, 5000);

        return () => {
            clearInterval(intervalRef.current);
            abortRef.current?.abort();
            console.log("Cleaned up polling and abort controller");
        };
    }, [dispatch, trackerId]);

    return path;
}
