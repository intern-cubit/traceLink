import React from "react";

export default function TrackerTabs({ activeTab, onChange }) {
    return (
        <div className="flex space-x-4 border-b mb-4">
            {["live", "history"].map(tab => (
                <button
                    key={tab}
                    onClick={() => onChange(tab)}
                    className={`pb-2 ${activeTab === tab
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                >
                    {tab === "live" ? "Live Location" : "Location History"}
                </button>
            ))}
        </div>
    );
}
