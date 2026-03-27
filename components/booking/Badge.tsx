import React from "react";

const colorClasses = {
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
};

export function Badge({ children, color = "gray" }: { children: React.ReactNode, color?: keyof typeof colorClasses }) {
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${colorClasses[color]}`}>
            {children}
        </span>
    );
}
