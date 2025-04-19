import { setLoading, setError, setTrackers } from "../features/trackerSlice";

const API_BASE = "/api";

export const fetchUserTrackers = () => async (dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
        const res = await fetch(`${API_BASE}/user/trackers`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        dispatch(setTrackers(data)); // data should be [{ tracker, latest, status }, …]
    } catch (err) {
        console.error("fetchUserTrackers error:", err);
        dispatch(setError("Could not load trackers"));
    } finally {
        dispatch(setLoading(false));
    }
};

export const fetchLiveLocation = (trackerId) => async (dispatch) => {
    try {
        const res = await fetch(`${API_BASE}/trackers/${trackerId}/live`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); // { latest, status }
        dispatch(
            updateTrackerLocation({
                deviceId: data.latest.deviceId,
                latitude: data.latest.latitude,
                longitude: data.latest.longitude,
                timestamp: data.latest.timestamp,
                main: data.latest.main,
                battery: data.latest.battery,
            })
        );
    } catch (err) {
        console.error("fetchLiveLocation error:", err);
    }
};

export const fetchHistory = (trackerId, from, to) => async () => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await fetch(
        `${API_BASE}/trackers/${trackerId}/history?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json(); // returns array of history points
};
