"use client";

import React, { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Tab1FormData } from "@/types/club-booking.types";
import type { LookupItem } from "@/types";

interface FieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <Label className="text-[#364153] font-medium text-[14px]">
                {label} {required && <span className="text-[#fb2c36]">*</span>}
            </Label>
            {children}
            {error && <p className="text-[12px] text-[#fb2c36] mt-0.5">{error}</p>}
        </div>
    );
}

interface Tab1Props {
    data: Tab1FormData;
    errors: Record<string, string>;
    onChange: (field: keyof Tab1FormData, value: string) => void;
}

const GUEST_REGIONS = ["Domestics", "International", "North", "South", "East", "West"];

export function Tab1EventInfo({ data, errors, onChange }: Tab1Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {/* Guest Region */}
            <Field label="Guest Region" error={errors.guest_region}>
                <Select value={data.guest_region} onValueChange={(v) => onChange("guest_region", v)}>
                    <SelectTrigger className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        {GUEST_REGIONS.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>



            {/* Event Name */}
            <Field label="Event Name" required error={errors.event_name}>
                <Input
                    placeholder="Event Name"
                    value={data.event_name}
                    onChange={(e) => onChange("event_name", e.target.value)}
                    className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]"
                />
            </Field>

            {/* From Date */}
            <Field label="From Date" required error={errors.from_date}>
                <Input
                    type="date"
                    value={data.from_date}
                    onChange={(e) => onChange("from_date", e.target.value)}
                    className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]"
                />
            </Field>

            {/* To Date */}
            <Field label="To Date" required error={errors.to_date}>
                <Input
                    type="date"
                    value={data.to_date}
                    min={data.from_date || undefined}
                    onChange={(e) => onChange("to_date", e.target.value)}
                    className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]"
                />
            </Field>
        </div>
    );
}
