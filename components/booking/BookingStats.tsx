import React from "react";
import { Calendar, Users, Utensils, Bed } from "lucide-react";

export function BookingStats({ days, guests, meals, stays }: { days: number, guests: number, meals: number, stays: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard icon={<Calendar className="w-5 h-5 text-indigo-500" />} label="Total Days" value={days} />
            <StatCard icon={<Users className="w-5 h-5 text-blue-500" />} label="Guests" value={guests} />
            <StatCard icon={<Utensils className="w-5 h-5 text-orange-500" />} label="Meal Entries" value={meals} />
            <StatCard icon={<Bed className="w-5 h-5 text-purple-500" />} label="Stay Entries" value={stays} />
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
    return (
        <div className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl p-4">
            <div className="p-2 bg-gray-50 rounded-lg shrink-0">{icon}</div>
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-lg font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}
