"use client";
import React, { useState } from "react";
import { ChevronDown, Utensils, Bed, User, MapPin } from "lucide-react";
import { Badge } from "./Badge";
import { InfoRow } from "./InfoRow";

export function DayAccordion({ dayData }: { dayData: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const { dateStr, food, stay } = dayData;

    // Calculate quick summary metrics
    const totalGuests = food.reduce((acc: number, f: any) => acc + (Number(f.total_no_of_guest) || 0), 0) || stay.length;
    const mealsTypes = Array.from(new Set(food.map((f: any) => f.meal_type).filter(Boolean)));
    const totalVeg = food.reduce((acc: number, f: any) => acc + (Number(f.veg) || 0), 0);
    const totalNonVeg = food.reduce((acc: number, f: any) => acc + (Number(f.non_veg) || 0), 0);
    const totalJain = food.reduce((acc: number, f: any) => acc + (Number(f.jain) || 0), 0);
    
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left transition-all duration-200">
            {/* Header Trigger */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors gap-3"
            >
                {/* Left side: Date & Main signal */}
                <div className="flex items-center gap-4">
                    <div className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-100 min-w-[100px] text-left md:text-center wrap-break-word w-max! md:w-auto!">
                        {dateStr}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 font-bold text-gray-800">
                            👥 {totalGuests || "-"} Guests
                        </span>
                        {mealsTypes.length > 0 && (
                            <span className="hidden md:inline-flex text-gray-300 text-sm">|</span>
                        )}
                        <span className="text-gray-600 text-sm hidden md:inline-flex font-medium">
                            {mealsTypes.join(", ")}
                        </span>
                    </div>
                </div>

                {/* Right side: Quick Tags & Arrow */}
                <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                    <div className="flex flex-wrap gap-1.5">
                        {totalVeg > 0 && <Badge color="green">Veg: {totalVeg}</Badge>}
                        {totalNonVeg > 0 && <Badge color="red">Non-Veg: {totalNonVeg}</Badge>}
                        {totalJain > 0 && <Badge color="yellow">Jain: {totalJain}</Badge>}
                        {stay.length > 0 && <Badge color="blue">{stay.length} Stays</Badge>}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </div>
            </button>

            {/* Expanded Content Grid Animation */}
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <div className="p-5 pt-0 border-t border-gray-50 flex flex-col gap-6 mt-4">
                        
                        {/* Food List */}
                        {food.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-orange-500" /> Food & Catering
                                </h4>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                    {food.map((f: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <div>
                                                    <span className="font-semibold text-gray-800">{f.distributor_or_guest_name || f.booking_for || "General"}</span>
                                                    <p className="text-xs text-gray-500 mt-0.5">{f.meal_type} • {f.food_preferences}</p>
                                                </div>
                                                <Badge color="gray">{f.total_no_of_guest || 0} Guests</Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {f.veg > 0 && <Badge color="green">{f.veg} Veg</Badge>}
                                                {f.non_veg > 0 && <Badge color="red">{f.non_veg} Non-Veg</Badge>}
                                                {f.jain > 0 && <Badge color="yellow">{f.jain} Jain</Badge>}
                                            </div>
                                            <div className="space-y-1.5 pt-2 border-t border-gray-200">
                                                {f.firm_or_hospital_name && <InfoRow icon={<MapPin size={14}/>} label="Firm" value={f.firm_or_hospital_name} />}
                                                {(f.state || f.country) && <InfoRow icon={<MapPin size={14}/>} label="Region" value={`${f.state || ''} ${f.country || ''}`.trim()} />}
                                                {f.remark && <p className="text-xs text-gray-500 italic mt-1">"{f.remark}"</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stay List */}
                        {stay.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Bed className="w-4 h-4 text-purple-500" /> Stay Details
                                </h4>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                    {stay.map((s: any, idx: number) => (
                                        <div key={idx} className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <div>
                                                    <span className="font-semibold text-gray-800">{s.name || s.distributor_or_guest_name || "Unknown Guest"}</span>
                                                    <p className="text-xs text-gray-500 mt-0.5">{s.designation || s.booking_for}</p>
                                                </div>
                                                {s.repeat_guest === "Yes" && <Badge color="blue">Repeat Guest</Badge>}
                                            </div>
                                            <div className="space-y-1.5 mt-3 pt-2 border-t border-blue-100/50">
                                                <InfoRow icon={<User size={14}/>} label="Dates" value={`${s.check_in_date || '?'} to ${s.check_out_date || '?'}`} />
                                                {s.firm_or_hospital_name && <InfoRow icon={<MapPin size={14}/>} label="Firm" value={s.firm_or_hospital_name} />}
                                                {s.remark && <p className="text-xs text-gray-500 italic mt-1">"{s.remark}"</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
