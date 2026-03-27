import { Bed, MapPin, Calendar, Info, Briefcase } from "lucide-react";
import type { StayEntry } from "@/types/club-booking.types";

export function StayCard({ stay }: { stay: StayEntry }) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 pb-4 border-b border-gray-50 gap-4">
                <div className="flex items-start gap-3">
                    <div className="bg-indigo-50 p-2 text-indigo-600 rounded-lg shrink-0">
                        <Bed className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{stay.distributor_or_guest_name || stay.name || "Unknown Guest"}</h3>
                        <p className="text-sm text-gray-500">{stay.designation || "No Designation"}</p>
                    </div>
                </div>
                <div className="flex flex-wrap sm:flex-col sm:items-end gap-2">
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded border border-blue-100">
                        {stay.booking_for || "Stay"}
                    </span>
                    {stay.repeat_guest === "Yes" && (
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                            Repeat Guest
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 text-sm mt-4">
                <InfoItem icon={<Calendar size={16} />} label="Check In" value={stay.check_in_date} />
                <InfoItem icon={<Calendar size={16} />} label="Check Out" value={stay.check_out_date} />
                <InfoItem icon={<Briefcase size={16} />} label="Firm/Hospital" value={stay.firm_or_hospital_name} />
                <InfoItem icon={<MapPin size={16} />} label="Location" value={[stay.state, stay.country].filter(Boolean).join(", ")} />
                <InfoItem icon={<Info size={16} />} label="Remark" value={stay.remark} className="col-span-2 lg:col-span-1" />
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value, className = "" }: { icon: any, label: string, value?: string, className?: string }) {
    if (!value) return null;
    return (
        <div className={`flex items-start gap-2 ${className}`}>
            <div className="text-gray-400 mt-0.5">{icon}</div>
            <div>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="font-medium text-gray-800 wrap-break-word">{value}</p>
            </div>
        </div>
    );
}
