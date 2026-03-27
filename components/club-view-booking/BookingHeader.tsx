import { Calendar, MapPin, Hash } from "lucide-react";

export function BookingHeader({ booking }: { booking: any }) {
    return (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{booking?.event_name || "Event Name"}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
                    <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm">
                        <Hash className="w-4 h-4 text-blue-500" />
                        {booking?.name || "Booking ID"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 text-gray-700">
                        {booking?.status || "Status"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {booking?.guest_region || "Region"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        <Calendar className="w-4 h-4 text-green-500" />
                        {booking?.from_date} <span className="text-gray-400 mx-1">→</span> {booking?.to_date}
                    </span>
                </div>
            </div>
        </div>
    );
}
