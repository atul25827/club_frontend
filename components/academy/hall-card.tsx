"use client";

import { Hall } from "@/types";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Wifi, Monitor, Users, Building2 } from "lucide-react";

interface HallCardProps {
    hall: Hall;
    academyName?: string; // Optional, can be derived or passed
}

export function HallCard({ hall, academyName }: HallCardProps) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const handleBookNow = () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        // Redirect to booking form mode with this hall selected
        router.push(`/book?academyId=${hall.academyId}&action=book`);
    };

    return (
        <div className="relative w-full max-w-[380px] h-[300px] group mx-auto md:mx-0">
            {/* Main Card Container */}
            <div className="relative h-[280px] w-full rounded-[16px] overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-white/10" />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80" />

                {/* Title */}
                <div className="absolute top-6 left-6">
                    <h3 className="text-white font-poppins text-xl font-medium tracking-wide shadow-black/20 drop-shadow-md">
                        {hall.name}
                    </h3>
                    <p className="text-white/80 text-xs font-poppins mt-1">{academyName || "Meril Academy"}</p>
                </div>

                {/* Amenities / Stats Row (Mocked based on Figma design) */}
                <div className="absolute bottom-6 left-6 flex gap-4">
                    {hall && hall?.wifi && (
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <Wifi className="w-4 h-4 text-[#7D3FD0]" />
                            </div>
                            <span className="text-[10px] text-white font-medium">Wi-Fi</span>
                        </div>
                    )}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Users className="w-4 h-4 text-[#7D3FD0]" />
                        </div>
                        <span className="text-[10px] text-white font-medium">{hall.capacity}</span>
                    </div>
                    {hall?.screen && (
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <Monitor className="w-4 h-4 text-[#7D3FD0]" />
                            </div>
                            <span className="text-[10px] text-white font-medium">Screen</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating 'Book Now' Button (Overlapping bottom-right) */}
            <div
                onClick={handleBookNow}
                className="absolute bottom-0 right-0 z-10 cursor-pointer"
            >
                <div className="bg-[#7D3FD0] hover:bg-[#6833ae] transition-colors w-[180px] h-[52px] rounded-tl-[24px] rounded-br-[24px] flex items-center justify-center shadow-lg transform translate-y-2 translate-x-2 group-hover:translate-x-1 group-hover:translate-y-1 duration-300">
                    <span className="text-white font-poppins font-medium text-lg ">Book Now</span>
                </div>
            </div>
        </div>
    );
}
