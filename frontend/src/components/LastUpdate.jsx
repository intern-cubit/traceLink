import { Clock } from 'lucide-react';

function LastUpdate({ deviceStats, selectedDevice }) {
    // Calculate the difference between the current date and the timestamp
    const currentDate = new Date();
    const lastUpdatedDate = new Date(selectedDevice?.latest?.timestamp);
    console.log('Last Updated Date:', lastUpdatedDate);
    console.log(selectedDevice?.Latest?.timestamp)
    const timeDifference = currentDate - lastUpdatedDate; // Difference in milliseconds

    // Convert the difference to readable units (in seconds, minutes, hours, etc.)
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let timeAgo = '';
    if (days > 0) {
        timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (seconds > 0) {
        timeAgo = `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    } else {
        timeAgo = 'Just now';
    }

    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" /> Last Update
            </div>
            <div className="font-medium text-white">{timeAgo}</div>
        </div>
    );
}

export default LastUpdate;