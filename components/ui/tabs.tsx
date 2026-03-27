"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TabsProps {
    tabs: {
        id: string;
        label: string;
        content: React.ReactNode;
        icon?: React.ReactNode;
    }[];
    activeTabId?: string;
    onChange?: (id: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeTabId, onChange, className }: TabsProps) {
    const [internalActiveTab, setInternalActiveTab] = React.useState(activeTabId || tabs[0]?.id);

    const activeId = activeTabId || internalActiveTab;

    const handleTabClick = (id: string) => {
        setInternalActiveTab(id);
        if (onChange) onChange(id);
    };

    return (
        <div className={cn("space-y-8", className)}>
            <div className="flex justify-center sm:justify-start">
                <div className="inline-flex items-center p-1.5 bg-[#F2F5F8] rounded-[20px] shadow-sm relative border border-[#E9EFF5]">
                    {tabs.map((tab) => {
                        const isActive = activeId === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={cn(
                                    "px-8 py-3.5 text-[15px] font-semibold transition-all duration-300 rounded-[16px] relative z-10 flex items-center gap-2 cursor-pointer",
                                    isActive 
                                        ? "text-[#33398A]" 
                                        : "text-[#5A5A5A] hover:text-[#33398A]"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white rounded-[16px] shadow-[0px_4px_12px_rgba(51,57,138,0.08)] border border-[rgba(51,57,138,0.05)]"
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                    />
                                )}
                                <span className="relative z-20">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <motion.div 
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="min-h-[400px]"
            >
                {tabs.find((tab) => tab.id === activeId)?.content}
            </motion.div>
        </div>
    );
}
