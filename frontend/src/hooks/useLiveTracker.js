import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    updateTrackerLocation,
    setError,
    setLoading,
} from "../features/trackerSlice";

export function useLiveTracker() {
    const dispatch = useDispatch();
    const trackerId = localStorage.getItem("selectedTrackerId");
    const [path, setPath] = useState([]);
    const [latest, setLatest] = useState(null);
    const intervalRef = useRef(null);
    const abortRef = useRef(null);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (!trackerId) {
            console.warn("No trackerId set. Skipping live tracker polling.");
            return;
        }

        const fetchLive = async () => {
            dispatch(setLoading(true));
            if (abortRef.current) abortRef.current.abort();

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const response = await fetch(
                    `${BACKEND_URL}/api/user/trackers/${trackerId}/live`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Failed to fetch live location"
                    );
                }

                const { latest, status } = await response.json();
                const { latitude, longitude, timestamp } = latest;

                dispatch(
                    updateTrackerLocation({
                        deviceId: trackerId,
                        latitude,
                        longitude,
                        timestamp,
                        status,
                    })
                );

                setLatest([latitude, longitude]);
                setPath((prev) => [...prev, [latitude, longitude]]);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error fetching live data:", err.message);
                    dispatch(setError(err.message));
                }
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchLive();
        intervalRef.current = setInterval(fetchLive, 5000);

        return () => {
            clearInterval(intervalRef.current);
            abortRef.current?.abort();
        };
    }, [dispatch, trackerId]);

    return { path, latest };
}
