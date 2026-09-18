"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Search, Plus, User, Building2, Stethoscope } from "lucide-react";
import type { MasterDataOption } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MasterDataSelectProps {
    value: string;
    displayLabel?: string;
    onChange: (value: string, label: string) => void;
    fetchOptions: (search?: string) => Promise<MasterDataOption[]>;
    onAddNew?: () => void;
    addNewLabel?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MasterDataSelect({
    value,
    displayLabel,
    onChange,
    fetchOptions,
    onAddNew,
    addNewLabel = "+ Add New",
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyMessage = "No results found",
    icon,
    disabled = false,
    className,
}: MasterDataSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState<MasterDataOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(displayLabel || "");
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load initial options
    const loadOptions = useCallback((term?: string) => {
        setIsLoading(true);
        fetchOptions(term)
            .then(setOptions)
            .finally(() => setIsLoading(false));
    }, [fetchOptions]);

    // Load on mount
    useEffect(() => { loadOptions(); }, [loadOptions]);

    // Update label when displayLabel prop changes
    useEffect(() => {
        if (displayLabel !== undefined) setSelectedLabel(displayLabel);
    }, [displayLabel]);

    // Focus & reset on open/close
    useEffect(() => {
        if (open) {
            loadOptions(); // Refresh on open
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setSearch("");
        }
    }, [open, loadOptions]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadOptions(val), 300);
    };

    const handleSelect = (opt: MasterDataOption) => {
        onChange(opt.value, opt.label);
        setSelectedLabel(opt.label);
        setOpen(false);
    };

    const resolvedLabel = selectedLabel || (value ? options.find(o => o.value === value)?.label : null);

    return (
        <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        "flex h-[42px] w-full items-center justify-between rounded-[8px] border-2 border-[#e5e7eb] bg-white px-3 py-2 text-sm",
                        "transition-all focus:outline-none focus:border-[#7D3FD0] focus:ring-2 focus:ring-[#7D3FD0]/20",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                        open && "border-[#7D3FD0] ring-2 ring-[#7D3FD0]/20",
                        className
                    )}
                    aria-expanded={open}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        {icon && <span className="shrink-0">{icon}</span>}
                        <span className={cn("truncate text-sm font-medium", resolvedLabel ? "text-[#101828]" : "text-[#9ca3af]")}>
                            {resolvedLabel ?? placeholder}
                        </span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-[#6a7282] shrink-0 transition-transform duration-200", open && "rotate-180")} />
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={4}
                className="p-0 shadow-lg shadow-black/8 border border-[#e5e7eb] rounded-lg overflow-hidden"
                style={{ width: "var(--radix-popover-trigger-width)", minWidth: "220px" }}
            >
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#f0f0f0] bg-[#faf8ff]">
                    <Search className="w-4 h-4 text-[#9ca3af] shrink-0" />
                    <input
                        ref={inputRef}
                        value={search}
                        onChange={handleSearch}
                        placeholder={searchPlaceholder}
                        className="flex-1 bg-transparent text-sm text-[#101828] font-medium placeholder:text-[#9ca3af] outline-none"
                    />
                    {search && (
                        <button type="button" onClick={() => { setSearch(""); loadOptions(); }}
                            className="text-[#9ca3af] hover:text-[#364153] text-[16px] leading-none transition-colors">×</button>
                    )}
                </div>

                {/* Options */}
                <div className="max-h-[220px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6 text-sm text-[#9ca3af]">
                            <span className="animate-pulse">Loading...</span>
                        </div>
                    ) : options.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-1">
                            <span className="text-sm text-[#9ca3af]">{emptyMessage}</span>
                        </div>
                    ) : (
                        options.map(option => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={cn(
                                        "flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-left",
                                        "transition-colors hover:bg-[#f8f5ff] hover:text-[#7D3FD0]",
                                        isSelected && "bg-[#faf7ff] text-[#7D3FD0]"
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#7D3FD0]" />}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Add New - sticky at bottom */}
                {onAddNew && (
                    <button
                        type="button"
                        onClick={() => { setOpen(false); onAddNew(); }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[#7D3FD0] hover:bg-[#f8f5ff] border-t border-[#f0f0f0] sticky bottom-0 bg-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {addNewLabel}
                    </button>
                )}

                {/* Footer count */}
                {!isLoading && options.length > 0 && (
                    <div className="px-3 py-1.5 border-t border-[#f0f0f0] bg-[#faf8ff] text-[11px] text-[#9ca3af] font-medium">
                        {options.length} results
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
