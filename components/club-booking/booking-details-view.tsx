"use client";

import React, { useMemo } from 'react';
import { BookingSummary } from "../booking/BookingSummary";
import { DayAccordion } from "../booking/DayAccordion";
import { Inbox } from "lucide-react";
import type { FoodCateringEntry, StayEntry } from "@/types/club-booking.types";

export function BookingDetailsView({ booking }: { booking: any }) {
    
    const { dayGroups, stats } = useMemo(() => {
        const foodList: FoodCateringEntry[] = booking?.food_and_catering || [];
        const stayList: StayEntry[] = booking?.stay || booking?.stay_details || [];
        
        const dayMap: Record<string, { dateStr: string, food: any[], stay: any[] }> = {};
        
        // Group Food
        foodList.forEach(food => {
            const dayKey = food.day || "Unspecified Day";
            if (!dayMap[dayKey]) dayMap[dayKey] = { dateStr: dayKey, food: [], stay: [] };
            dayMap[dayKey].food.push(food);
        });
        
        // Group Stay
        stayList.forEach(stay => {
            const checkIn = stay.check_in_date || "Unspecified Day";
            let foundKey = Object.keys(dayMap).find(k => k.includes(checkIn) || checkIn.includes(k));
            if (!foundKey) foundKey = checkIn;
            
            if (!dayMap[foundKey]) dayMap[foundKey] = { dateStr: foundKey, food: [], stay: [] };
            dayMap[foundKey].stay.push(stay);
        });
        
        const groups = Object.values(dayMap).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
        
        // Calculate aggregate stats
        let totalGuests = 0;
        foodList.forEach(f => { totalGuests += (Number(f.total_no_of_guest) || 0) });
        if (totalGuests === 0) totalGuests = stayList.length; // fallback if only stay guests exist
        
        const calculatedStats = {
            days: groups.length,
            guests: totalGuests,
            meals: foodList.length,
            stays: stayList.length
        };
        
        return { dayGroups: groups, stats: calculatedStats };
    }, [booking]);

    return (
        <div className="w-full max-w-7xl mx-auto p-0 sm:p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
            <BookingSummary booking={booking} stats={stats} />
            
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight pt-2 px-1">Timeline Day-by-Day</h2>
                {dayGroups.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {dayGroups.map((group, idx) => (
                            <DayAccordion key={idx} dayData={group} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                        <div className="bg-gray-50 p-3 rounded-full text-gray-400 mb-4 border border-gray-100">
                            <Inbox className="w-6 h-6" />
                        </div>
                        <p className="text-gray-500 font-medium tracking-tight">No food or stay records found</p>
                    </div>
                )}
            </div>
        </div>
    );
}


