"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Plus, Calendar, Trash2, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { generateDayOptions, toFrappeDatetime } from "@/lib/date-utils";
import { validateTab2Draft, toErrorMap, type Tab2Draft } from "@/lib/booking-validation";
import type { FoodCateringEntry, DayOption } from "@/types/club-booking.types";
import type { ClubMasterData, Country, State } from "@/types";

// ─── Reusable Field wrapper ───────────────────────────────────────────────────

function Field({ label, required, error, children }: {
    label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
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

// ─── Empty draft ──────────────────────────────────────────────────────────────

function emptyDraft(booking_for: string): Tab2Draft {
    return {
        booking_for,
        day: "",
        total_no_of_guest: "",
        distributor_or_guest_name: "",
        designation: "",
        firm_or_hospital_name: "",
        repeat_guest: "",
        state: "",
        country: "",
        food_preferences: "",
        meal_type: "",
        veg: "",
        non_veg: "",
        jain: "",
        other: "",
        stay_required: false,
        check_in_date: "",
        check_out_date: "",
        remark: "",
    };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Tab2Props {
    fromDate: string;
    toDate: string;
    masterData: ClubMasterData | null;
    entries: FoodCateringEntry[];
    onAdd: (entry: FoodCateringEntry) => void;
    onRemove: (id: string) => void;
    isSubmitting?: boolean;
}

// ─── Helper: parse comma-separated string to array ────────────────────────────

function csvToArray(csv: string): string[] {
    return csv ? csv.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Tab2FoodCatering({
    fromDate, toDate, masterData, entries, onAdd, onRemove, isSubmitting,
}: Tab2Props) {

    // Day options derived from Tab1 dates
    const dayOptions = useMemo<DayOption[]>(
        () => generateDayOptions(fromDate, toDate),
        [fromDate, toDate]
    );

    // Draft form state
    const [draft, setDraft] = useState<Tab2Draft>(() => emptyDraft(""));
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Country / State for Club House
    const [countries, setCountries] = useState<Country[]>([]);
    const [isCountryLoading, setIsCountryLoading] = useState(false);
    const [states, setStates] = useState<State[]>([]);
    const [isStateLoading, setIsStateLoading] = useState(false);

    // Fetch countries on mount
    useEffect(() => {
        setIsCountryLoading(true);
        api.getCountries().then(setCountries).finally(() => setIsCountryLoading(false));
    }, []);

    // Fetch states when country changes
    useEffect(() => {
        if (!draft.country) { setStates([]); return; }
        setIsStateLoading(true);
        setStates([]);
        setDraft((d) => ({ ...d, state: "" }));
        api.getStates(draft.country).then(setStates).finally(() => setIsStateLoading(false));
    }, [draft.country]);

    const handleCountrySearch = useCallback((term: string) => {
        setIsCountryLoading(true);
        api.getCountries(term || undefined).then(setCountries).finally(() => setIsCountryLoading(false));
    }, []);

    // Field change handler
    const set = (field: keyof Tab2Draft, value: any) => {
        setDraft((d) => ({ ...d, [field]: value }));
        if (errors[field]) setErrors((e) => { const next = { ...e }; delete next[field]; return next; });
    };

    // ── Derived: Club = single select food pref, no count fields ──
    const isClub = draft.booking_for === "Club";

    const selectedFoodPrefs = useMemo(
        () => csvToArray(draft.food_preferences).map((s) => s.toLowerCase()),
        [draft.food_preferences]
    );

    // Count fields only visible when NOT Club
    const showVegCount = !isClub && selectedFoodPrefs.some((p) => p === "veg" || p === "vegetarian");
    const showNonVegCount = !isClub && selectedFoodPrefs.some((p) => p.includes("non"));
    const showJainCount = !isClub && selectedFoodPrefs.some((p) => p.includes("jain"));
    const showOtherCount = !isClub && selectedFoodPrefs.some((p) => p.includes("other"));

    // ── Multi-select option arrays from master data ──
    const dayMultiOptions = useMemo(
        () => dayOptions.map((d) => ({ label: d.label, value: d.value })),
        [dayOptions]
    );

    const foodPrefOptions = useMemo(
        () => (masterData?.food_preferences ?? []).map((item) => ({ label: item.name, value: item.name })),
        [masterData?.food_preferences]
    );

    const mealTypeOptions = useMemo(
        () => (masterData?.meal_type ?? []).map((item) => ({ label: item.name, value: item.name })),
        [masterData?.meal_type]
    );

    // Add entry
    const handleAdd = () => {
        const validationErrors = validateTab2Draft(draft);
        if (validationErrors.length > 0) {
            setErrors(toErrorMap(validationErrors));
            return;
        }

        const entry: FoodCateringEntry = {
            booking_for: draft.booking_for,
            day: draft.day,
            total_no_of_guest: draft.total_no_of_guest ? Number(draft.total_no_of_guest) : undefined,
            distributor_or_guest_name: draft.distributor_or_guest_name || undefined,
            designation: draft.designation || undefined,
            firm_or_hospital_name: draft.firm_or_hospital_name || undefined,
            repeat_guest: (draft.repeat_guest === "Yes" || draft.repeat_guest === "No") ? draft.repeat_guest : undefined,
            state: draft.state || undefined,
            country: draft.country || undefined,
            food_preferences: draft.food_preferences,
            meal_type: draft.meal_type,
            veg: draft.veg ? Number(draft.veg) : undefined,
            non_veg: draft.non_veg ? Number(draft.non_veg) : undefined,
            jain: draft.jain ? Number(draft.jain) : undefined,
            other: draft.other ? Number(draft.other) : undefined,
            is_stay: draft.stay_required ? 1 : 0,
            is_food: 1,
            check_in_date: toFrappeDatetime(draft.check_in_date) || undefined,
            check_out_date: toFrappeDatetime(draft.check_out_date) || undefined,
            remark: draft.remark,
        };

        onAdd(entry);
        setDraft(emptyDraft("")); // Reset to empty
        setErrors({});
    };

    const hasGuestDetails = draft.booking_for === "Club" || draft.booking_for === "Club House" || draft.booking_for === "Guest";

    // ── Helper: get badge for food/stay ──
    const getTypeBadge = (entry: FoodCateringEntry) => {
        const isStay = entry.is_stay === 1 || entry.stay_required;
        const isFood = entry.is_food === 1;

        if (isStay && isFood) {
            return (
                <div className="flex items-center gap-1">
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-50 text-green-700">
                        Food
                    </span>
                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-50 text-orange-600">
                        Stay
                    </span>
                </div>
            );
        }
        if (isFood) {
            return (
                <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-50 text-green-700">
                    Food
                </span>
            );
        }
        if (isStay) {
            return (
                <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-50 text-orange-600">
                    Stay
                </span>
            );
        }
        return <span className="text-[#9ca3af] text-xs">—</span>;
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">

                {/* Booking For */}
                <Field label="Booking For" required error={errors.booking_for}>
                    <Select value={draft.booking_for} onValueChange={(v) => set("booking_for", v)}>
                        <SelectTrigger className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {(masterData?.booking_for ?? []).map((item) => (
                                <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                {/* Day Wise Plan - MultiSelect */}
                <Field label="Day Wise Plan" required error={errors.day}>
                    {dayOptions.length === 0 ? (
                        <div className="h-[42px] flex items-center px-3 border-2 border-[#e5e7eb] rounded-[8px] text-sm text-[#9ca3af]">
                            Set From/To date in Tab 1
                        </div>
                    ) : (
                        <MultiSelect
                            options={dayMultiOptions}
                            value={csvToArray(draft.day)}
                            onChange={(selected) => set("day", selected.join(", "))}
                            placeholder="Select days"
                            showSelectAll
                            error={!!errors.day}
                        />
                    )}
                </Field>

                {/* Conditional Guest Fields */}
                {!hasGuestDetails ? (
                    <Field label="Total Number of Guests" required error={errors.total_no_of_guest}>
                        <Input
                            type="number"
                            min={1}
                            placeholder="120"
                            value={draft.total_no_of_guest}
                            onChange={(e) => set("total_no_of_guest", e.target.value)}
                            className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]"
                        />
                    </Field>
                ) : (
                    <Field label="Distributors/Guest Name" required error={errors.distributor_or_guest_name}>
                        <Input
                            placeholder="Distributors/Guest Name"
                            value={draft.distributor_or_guest_name}
                            onChange={(e) => set("distributor_or_guest_name", e.target.value)}
                            className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]"
                        />
                    </Field>
                )}

                {/* Guest only fields */}
                {hasGuestDetails && (
                    <>
                        <Field label="Designation" error={errors.designation}>
                            <Input placeholder="Designation" value={draft.designation}
                                onChange={(e) => set("designation", e.target.value)}
                                className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                        </Field>
                        <Field label="Firm/Hospital Name" error={errors.firm_or_hospital_name}>
                            <Input placeholder="Firm/Hospital Name" value={draft.firm_or_hospital_name}
                                onChange={(e) => set("firm_or_hospital_name", e.target.value)}
                                className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                        </Field>
                        <Field label="Repeat Guest" error={errors.repeat_guest}>
                            <Select value={draft.repeat_guest} onValueChange={(v) => set("repeat_guest", v)}>
                                <SelectTrigger className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Country" error={errors.country}>
                            <SearchableSelect options={countries} value={draft.country}
                                onChange={(v) => set("country", v)}
                                onSearch={handleCountrySearch}
                                placeholder="Select Country" searchPlaceholder="Search country..."
                                emptyMessage="No countries available" loadingMessage="Loading..."
                                isLoading={isCountryLoading} />
                        </Field>
                        <Field label="State" error={errors.state}>
                            <SearchableSelect options={states} value={draft.state}
                                onChange={(v) => set("state", v)}
                                placeholder="Select State" searchPlaceholder="Search state..."
                                emptyMessage={draft.country ? "No states found" : "Select a country first"}
                                loadingMessage="Loading states..."
                                isLoading={isStateLoading}
                                disabled={!draft.country} />
                        </Field>
                    </>
                )}

                {/* Food Preference - Single select for Club, MultiSelect otherwise */}
                <Field label="Food Preference" required error={errors.food_preferences}>
                    {isClub ? (
                        <Select value={draft.food_preferences} onValueChange={(v) => set("food_preferences", v)}>
                            <SelectTrigger className="h-[42px]">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {(masterData?.food_preferences ?? []).map((item) => (
                                    <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <MultiSelect
                            options={foodPrefOptions}
                            value={csvToArray(draft.food_preferences)}
                            onChange={(selected) => set("food_preferences", selected.join(", "))}
                            placeholder="Select preferences"
                            showSelectAll
                            error={!!errors.food_preferences}
                        />
                    )}
                </Field>

                {/* Meal Type - MultiSelect (no count fields depend on this) */}
                <Field label="Meal Type" required error={errors.meal_type}>
                    <MultiSelect
                        options={mealTypeOptions}
                        value={csvToArray(draft.meal_type)}
                        onChange={(selected) => set("meal_type", selected.join(", "))}
                        placeholder="Select meal types"
                        showSelectAll
                        error={!!errors.meal_type}
                    />
                </Field>

                {/* Count fields based on food_preferences (NOT meal_type) */}
                {showVegCount && (
                    <Field label="Veg Count" error={errors.veg}>
                        <Input type="number" min={0} placeholder="80" value={draft.veg}
                            onChange={(e) => set("veg", e.target.value)}
                            className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                    </Field>
                )}
                {showNonVegCount && (
                    <Field label="Non-Veg Count" error={errors.non_veg}>
                        <Input type="number" min={0} placeholder="40" value={draft.non_veg}
                            onChange={(e) => set("non_veg", e.target.value)}
                            className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                    </Field>
                )}
                {showJainCount && (
                    <Field label="Jain Count" error={errors.jain}>
                        <Input type="number" min={0} placeholder="20" value={draft.jain}
                            onChange={(e) => set("jain", e.target.value)}
                            className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                    </Field>
                )}
                {showOtherCount && (
                    <Field label="Others Count" error={errors.other}>
                        <Input type="number" min={0} placeholder="10" value={draft.other}
                            onChange={(e) => set("other", e.target.value)}
                            className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                    </Field>
                )}

                {/* Stay Required (Guest only) */}
                {hasGuestDetails && (
                    <div className="flex flex-col gap-2 justify-center">
                        <label className="flex items-center gap-2 cursor-pointer mt-4">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300"
                                checked={draft.stay_required}
                                onChange={(e) => set("stay_required", e.target.checked)}
                            />
                            <span className="text-[#364153] font-medium text-[14px]">Stay Required</span>
                        </label>
                    </div>
                )}

                {/* Stay dates */}
                {draft.stay_required && hasGuestDetails && (
                    <>
                        <Field label="Check In Date and Time" required error={errors.check_in_date}>
                            <Input type="datetime-local" value={draft.check_in_date}
                                onChange={(e) => set("check_in_date", e.target.value)}
                                className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                        </Field>
                        <Field label="Check Out Date Time" required error={errors.check_out_date}>
                            <Input type="datetime-local" value={draft.check_out_date}
                                min={draft.check_in_date || undefined}
                                onChange={(e) => set("check_out_date", e.target.value)}
                                className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                        </Field>
                    </>
                )}

                {/* Remark */}
                <Field label="Remark" error={errors.remark}>
                    <div className="flex gap-3">
                        <Input placeholder="Remark" value={draft.remark}
                            onChange={(e) => set("remark", e.target.value)}
                            className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                        <Button
                            type="button"
                            onClick={handleAdd}
                            disabled={isSubmitting}
                            className="h-[42px] w-[42px] shrink-0 bg-[#7D3FD0] hover:bg-[#6a2eb8] p-0 rounded-[8px]"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-6 w-6" />}
                        </Button>
                    </div>
                </Field>
            </div>

            {/* Day Wise List Table */}
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-3 mb-2 border-b border-[#7D3FD0] pb-2">
                    <div className="bg-purple-50 text-[#7D3FD0] p-1.5 rounded-[8px]">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-[18px] font-medium text-[#101828]">Day Wise List</h3>
                    <span className="ml-auto text-[13px] text-[#6a7282]">{entries.length} entries</span>
                </div>

                {entries.length === 0 ? (
                    <div className="border border-dashed border-[#e5e7eb] rounded-[16px] py-10 text-center text-[#adadad] text-[14px]">
                        No entries yet. Fill the form above and click <b>+</b> to add.
                    </div>
                ) : (
                    <div className="border border-[#e5e7eb] rounded-[16px] overflow-x-auto shadow-sm">
                        <Table className="whitespace-nowrap min-w-[1400px]">
                            <TableHeader className="bg-[#f8f9fa]">
                                <TableRow>
                                    <TableHead className="font-medium text-[#364153]">Booking For</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Day</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Guest Name</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Designation</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Firm/Hospital</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Repeat Guest</TableHead>
                                    <TableHead className="font-medium text-[#364153]">State</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Country</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Food Pref.</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Meal Type</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Total Guests</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Veg</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Non-Veg</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Jain</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Other</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Food & Stay</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Remark</TableHead>
                                    <TableHead className="font-medium text-[#364153] sticky right-0 bg-[#f8f9fa]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry, index) => (
                                    <TableRow key={entry.name || String(index)} className="bg-white">
                                        <TableCell className="text-[#6a7282] font-medium">{entry.booking_for || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.day || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.distributor_or_guest_name || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.designation || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.firm_or_hospital_name || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.repeat_guest || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.state || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.country || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.food_preferences || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.meal_type || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.total_no_of_guest || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.veg || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.non_veg || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.jain || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.other || "-"}</TableCell>
                                        <TableCell>{getTypeBadge(entry)}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.remark || "-"}</TableCell>
                                        <TableCell className="sticky right-0 bg-white">
                                            <button
                                                type="button"
                                                onClick={() => entry.name && onRemove(entry.name)}
                                                className="cursor-pointer text-red-500 hover:text-red-500 transition-colors"
                                                title="Remove entry"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
