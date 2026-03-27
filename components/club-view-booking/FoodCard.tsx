import { Coffee, Pizza, Info, Users, Map, Calendar } from "lucide-react";
import type { FoodCateringEntry } from "@/types/club-booking.types";

export function FoodCard({ food }: { food: FoodCateringEntry }) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 pb-4 border-b border-gray-50 gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Day: {food.day || "—"}</h3>
                    <p className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                         <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{food.booking_for || "General"}</span>
                         {food.distributor_or_guest_name && (
                             <span>Guest: <span className="font-medium text-gray-700">{food.distributor_or_guest_name}</span></span>
                         )}
                    </p>
                </div>
                <div className="sm:text-right">
                   <div className="flex items-center sm:justify-end gap-1.5 text-gray-700 font-medium whitespace-nowrap">
                       <Users className="w-4 h-4 text-blue-500" /> {food.total_no_of_guest || 0} Guests
                   </div>
                   <div className="flex flex-wrap gap-2 mt-2">
                       <Badge count={food.veg} label="Veg" color="green" />
                       <Badge count={food.non_veg} label="Non-Veg" color="red" />
                       <Badge count={food.jain} label="Jain" color="orange" />
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 text-sm mt-4">
                <InfoItem icon={<Pizza size={16} />} label="Meal Type" value={food.meal_type} />
                <InfoItem icon={<Coffee size={16} />} label="Preference" value={food.food_preferences} />
                <InfoItem icon={<Map size={16} />} label="Location" value={[food.state, food.country].filter(Boolean).join(", ")} />
                <InfoItem icon={<Info size={16} />} label="Firm/Hospital" value={food.firm_or_hospital_name} />
                {food.stay_required && food.check_in_date && (
                   <InfoItem icon={<Calendar size={16} />} label="Stay Dates" value={`${food.check_in_date} to ${food.check_out_date}`} />
                )}
                <InfoItem icon={<Info size={16} />} label="Remark" value={food.remark} />
            </div>
        </div>
    );
}

function Badge({ count, label, color }: { count?: number, label: string, color: 'green' | 'red' | 'orange' }) {
    if (!count) return null;
    const colors = {
        green: 'text-green-700 bg-green-50 border-green-200',
        red: 'text-red-700 bg-red-50 border-red-200',
        orange: 'text-orange-700 bg-orange-50 border-orange-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${colors[color]}`}>
            {count} {label}
        </span>
    );
}

function InfoItem({ icon, label, value, className = "" }: { icon: any, label: string, value?: string | number, className?: string }) {
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
