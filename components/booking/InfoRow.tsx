import React from "react";

export function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value?: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-400">{icon}</span>
            <span className="font-medium text-gray-500">{label}:</span>
            <span className="text-gray-900 font-medium wrap-break-word">{value}</span>
        </div>
    );
}
