"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAcademy } from "@/context/academy-context";
// Mock Data for Academies

export function AcademyLocations() {
    const router = useRouter();
    const { academies } = useAcademy();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleCardClick = (id: number | string) => {
        router.push(`/book?academyId=${id}`);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of view
            const newScrollLeft = direction === 'left'
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount;

            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };
    return (
        <section className="py-8 md:py-12 relative overflow-hidden">
            <div className="container px-4 md:px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-[20px] md:text-[24px] font-poppins font-medium text-[#33398A]"
                    >
                        Meril Academy
                    </motion.h2>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll('left')}
                            className="rounded-full cursor-pointer md:w-12 md:h-12 w-10 h-10 border-slate-200 hover:bg-[#33398A] hover:text-white hover:border-[#33398A] transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll('right')}
                            className="rounded-full cursor-pointer md:w-12 md:h-12 w-10 h-10 border-slate-200 hover:bg-[#33398A] hover:text-white hover:border-[#33398A] transition-colors"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {academies?.map((academy, index) => (
                        <motion.div
                            key={academy.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleCardClick(academy.id)}
                            className="shrink-0 w-[85vw] sm:w-[400px] md:w-[486px] h-[320px] relative rounded-[16px] overflow-hidden snap-center group cursor-pointer"
                        >
                            <Image
                                src={academy?.imageUrl ?? ""}
                                alt={academy.name}
                                fill
                                unoptimized={true}
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* Figma-Specific Label Design */}
                            <div className="absolute bottom-0 right-0 z-10">
                                {/* The Purple Block */}
                                <div className="bg-[#7D3FD0] rounded-tl-[24px] rounded-br-[16px] w-[245px] h-[50px] flex items-center justify-center relative">
                                    <span className="text-white font-poppins text-lg font-medium">
                                        {academy.name}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
