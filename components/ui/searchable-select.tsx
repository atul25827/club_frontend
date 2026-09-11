"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Search, Globe } from "lucide-react";

export interface SelectOption {
    name: string;
    label?: string;
}

interface SearchableSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    onSearch?: (searchTerm: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    loadingMessage?: string;
    isLoading?: boolean;
    className?: string;
    disabled?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    onSearch,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyMessage = "No results found",
    loadingMessage = "Loading...",
    isLoading = false,
    className,
    disabled = false,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Defensive guard: always work with a real array even if caller passes wrong type
    const safeOptions = Array.isArray(options) ? options : [];

    const filtered = React.useMemo(() => {
        // When onSearch is provided, filtering is done server-side — just show all options returned
        if (onSearch) return safeOptions;
        if (!search) return safeOptions;
        const q = search.toLowerCase();
        return safeOptions.filter(o => (o.label ?? o.name).toLowerCase().includes(q));
    }, [safeOptions, search, onSearch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        if (onSearch) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                onSearch(val);
            }, 300);
        }
    };

    const selectedLabel = React.useMemo(() => {
        const found = safeOptions.find(o => o.name === value);
        return found ? (found.label ?? found.name) : null;
    }, [safeOptions, value]);

    // Focus search input when popover opens
    React.useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setSearch("");
        }
    }, [open]);

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
                        <Globe className="w-4 h-4 text-[#9ca3af] shrink-0" />
                        <span className={cn("truncate text-sm font-medium", selectedLabel ? "text-[#101828]" : "text-[#9ca3af]")}>
                            {selectedLabel ?? placeholder}
                        </span>
                    </div>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-[#6a7282] shrink-0 transition-transform duration-200",
                            open && "rotate-180"
                        )}
                    />
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={4}
                className="p-0 shadow-lg shadow-black/8 border border-[#e5e7eb] rounded-lg overflow-hidden"
                style={{ width: "var(--radix-popover-trigger-width)", minWidth: "220px" }}
            >
                {/* Search header */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#f0f0f0] bg-[#faf8ff]">
                    <Search className="w-4 h-4 text-[#9ca3af] shrink-0" />
                    <input
                        ref={inputRef}
                        value={search}
                        onChange={handleSearchChange}
                        placeholder={searchPlaceholder}
                        className="flex-1 bg-transparent text-sm text-[#101828] font-medium placeholder:text-[#9ca3af] outline-none"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="text-[#9ca3af] hover:text-[#364153] text-[16px] leading-none transition-colors"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Options list */}
                <div className="max-h-[220px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6 text-sm text-[#9ca3af]">
                            <span className="animate-pulse">{loadingMessage}</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-1">
                            <Globe className="w-5 h-5 text-[#d1d5db]" />
                            <span className="text-sm text-[#9ca3af]">{emptyMessage}</span>
                        </div>
                    ) : (
                        filtered.map(option => {
                            const label = option.label ?? option.name;
                            const isSelected = option.name === value;
                            return (
                                <button
                                    key={option.name}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.name);
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        "flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-left",
                                        "transition-colors hover:bg-[#f8f5ff] hover:text-[#7D3FD0]",
                                        isSelected && "bg-[#faf7ff] text-[#7D3FD0]"
                                    )}
                                >
                                    <span className="truncate">{label}</span>
                                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#7D3FD0]" />}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer count */}
                {!isLoading && filtered.length > 0 && (
                    <div className="px-3 py-1.5 border-t border-[#f0f0f0] bg-[#faf8ff] text-[11px] text-[#9ca3af] font-medium">
                        {filtered.length} of {options.length} results
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
