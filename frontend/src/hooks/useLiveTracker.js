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
    const [deviceDetails, setDeviceDetails] = useState(null);
    const intervalRef = useRef(null);
    const abortRef = useRef(null);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        setPath([]);
        setLatest(null);

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

                const { latest, status, diff } = await response.json();
                const { latitude, longitude, battery, main, timestamp } = latest;

                dispatch(
                    updateTrackerLocation({
                        deviceId: trackerId,
                        latitude,
                        longitude,
                        timestamp,
                        status,
                        battery,
                        main,
                        timestamp, 
                        diff
                    })
                );

                setLatest([latitude, longitude]);
                setDeviceDetails({ battery, main, timestamp });
                setPath((prev) => {
                    if (prev.length === 0) return [[latitude, longitude]];
                    const lastPoint = prev[prev.length - 1];
                    if (lastPoint[0] === latitude && lastPoint[1] === longitude) {
                        return prev; 
                    }
                    return [...prev, [latitude, longitude]];
                });
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
        intervalRef.current = setInterval(fetchLive, 60000);

        return () => {
            clearInterval(intervalRef.current);
            abortRef.current?.abort();
        };
    }, [dispatch, trackerId]);

    return { path, latest, deviceDetails };
}
