import { BookingStats } from "./BookingStats";
import { Hash } from "lucide-react";

export function BookingSummary({ booking, stats }: { booking: any, stats: any }) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{booking?.event_name || "Event Name"}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-semibold text-gray-700">
                            <Hash className="w-3.5 h-3.5" /> {booking?.name || "Booking ID"}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-medium text-gray-600">{booking?.guest_region || "Region"}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {booking?.from_date} → {booking?.to_date}
                        </span>
                    </div>
                </div>
            </div>
            
            <BookingStats {...stats} />
        </div>
    );
}
