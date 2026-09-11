"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
    label: string;
    value: string;
}

interface MultiSelectProps {
    options: MultiSelectOption[];
    value: string[]; // array of selected values
    onChange: (selected: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    showSelectAll?: boolean;
    className?: string;
    error?: boolean;
}

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = "Select",
    disabled = false,
    showSelectAll = true,
    className,
    error,
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const allSelected = options.length > 0 && value.length === options.length;

    const toggleOption = useCallback((optValue: string) => {
        onChange(
            value.includes(optValue)
                ? value.filter((v) => v !== optValue)
                : [...value, optValue]
        );
    }, [value, onChange]);

    const toggleAll = useCallback(() => {
        onChange(allSelected ? [] : options.map((o) => o.value));
    }, [allSelected, options, onChange]);

    const removeTag = useCallback((optValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optValue));
    }, [value, onChange]);

    const displayLabels = value
        .map((v) => options.find((o) => o.value === v)?.label ?? v)
        .filter(Boolean);

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            {/* ── Trigger ── */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((o) => !o)}
                className={cn(
                    "flex items-center justify-between w-full min-h-[42px] px-3 py-1.5",
                    "border-2 rounded-[8px] bg-white text-left transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-[#7D3FD0]/30 focus:border-[#7D3FD0]",
                    isOpen ? "border-[#7D3FD0] ring-2 ring-[#7D3FD0]/20" : "border-[#e5e7eb]",
                    error && "border-[#fb2c36]",
                    disabled && "opacity-50 cursor-not-allowed bg-gray-50",
                    !disabled && "cursor-pointer"
                )}
            >
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 pr-2">
                    {displayLabels.length === 0 ? (
                        <span className="text-[#9ca3af] text-sm">{placeholder}</span>
                    ) : allSelected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#f3e8ff] text-[#7D3FD0] px-2.5 py-1 rounded-md">
                            All Selected
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-[#5a2da0] transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange([]);
                                }}
                            />
                        </span>
                    ) : (
                        displayLabels.map((label, i) => (
                            <span
                                key={value[i]}
                                className="inline-flex items-center gap-1 text-xs font-medium bg-[#f3e8ff] text-[#7D3FD0] px-2 py-0.5 rounded-md max-w-[120px] truncate"
                            >
                                <span className="truncate">{label}</span>
                                <X
                                    className="h-3 w-3 shrink-0 cursor-pointer hover:text-[#5a2da0] transition-colors"
                                    onClick={(e) => removeTag(value[i], e)}
                                />
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-[#6a7282] transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* ── Dropdown ── */}
            {isOpen && (
                <div
                    className={cn(
                        "absolute z-50 mt-1 w-full bg-white rounded-lg border border-[#e5e7eb]",
                        "shadow-lg shadow-black/8 max-h-[240px] overflow-y-auto",
                        "animate-in fade-in slide-in-from-top-1 duration-150"
                    )}
                >
                    {/* Select All */}
                    {showSelectAll && options.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={toggleAll}
                                className={cn(
                                    "flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-semibold",
                                    "hover:bg-[#f3e8ff]/50 transition-colors text-left",
                                    allSelected ? "text-[#7D3FD0] bg-[#f3e8ff]/30" : "text-[#364153]"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                    allSelected
                                        ? "bg-[#7D3FD0] border-[#7D3FD0]"
                                        : "border-[#d1d5db] bg-white"
                                )}>
                                    {allSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                </div>
                                Select All
                            </button>
                            <div className="border-b border-[#f0f0f0]" />
                        </>
                    )}

                    {/* Options */}
                    {options.length === 0 ? (
                        <p className="text-sm text-[#9ca3af] px-3 py-3 text-center">No options available</p>
                    ) : (
                        options.map((opt) => {
                            const isChecked = value.includes(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => toggleOption(opt.value)}
                                    className={cn(
                                        "flex items-center gap-2.5 w-full px-3 py-2 text-sm",
                                        "hover:bg-[#f8f5ff] transition-colors text-left",
                                        isChecked ? "text-[#7D3FD0] bg-[#faf7ff]" : "text-[#364153]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                        isChecked
                                            ? "bg-[#7D3FD0] border-[#7D3FD0]"
                                            : "border-[#d1d5db] bg-white"
                                    )}>
                                        {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                    </div>
                                    <span className="font-medium">{opt.label}</span>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
