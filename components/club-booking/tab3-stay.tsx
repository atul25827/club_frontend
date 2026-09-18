"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MasterDataSelect } from "./master-data-select";
import { AddDistributorDialog, AddContactDialog, AddAccountDialog } from "./add-entity-dialog";
import { Plus, BedDouble, Trash2, Loader2, Building2, Stethoscope, User } from "lucide-react";
import { api } from "@/services/api";
import { formatDisplayDate, toFrappeDatetime } from "@/lib/date-utils";
import { validateTab3Draft, toErrorMap, type Tab3Draft } from "@/lib/booking-validation";
import type { StayEntry } from "@/types/club-booking.types";
import type { Country, State, MasterDataOption } from "@/types";

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

const emptyDraft: Tab3Draft = {
    guest_type: "",
    guest_name: "",
    distributor_name: "",
    account_name: "",
    contact_name: "",
    designation: "",
    check_in_date: "",
    check_out_date: "",
    repeat_guest: "",
    state: "",
    country: "",
    remark: "",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Tab3Props {
    entries: StayEntry[];
    onAdd: (entry: StayEntry) => void;
    onRemove: (id: string) => void;
    isSubmitting?: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Tab3Stay({ entries, onAdd, onRemove, isSubmitting }: Tab3Props) {
    const [draft, setDraft] = useState<Tab3Draft>(emptyDraft);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Country / State
    const [countries, setCountries] = useState<Country[]>([]);
    const [isCountryLoading, setIsCountryLoading] = useState(false);
    const [states, setStates] = useState<State[]>([]);
    const [isStateLoading, setIsStateLoading] = useState(false);

    // Display labels
    const [distributorLabel, setDistributorLabel] = useState("");
    const [contactLabel, setContactLabel] = useState("");
    const [accountLabel, setAccountLabel] = useState("");

    // Add-new dialog states
    const [showAddDistributor, setShowAddDistributor] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showAddAccount, setShowAddAccount] = useState(false);

    useEffect(() => {
        setIsCountryLoading(true);
        api.getCountries().then(setCountries).finally(() => setIsCountryLoading(false));
    }, []);

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

    // Auto-fetch account when doctor/contact is selected
    useEffect(() => {
        if (draft.guest_type === "Doctor" && draft.contact_name) {
            api.getAccountsByContact(draft.contact_name).then((accounts) => {
                if (accounts.length > 0) {
                    setDraft((d) => ({ ...d, account_name: accounts[0].value }));
                    setAccountLabel(accounts[0].label);
                }
            });
        }
    }, [draft.contact_name, draft.guest_type]);

    // Reset guest-type-dependent fields when guest type changes
    useEffect(() => {
        setDraft((d) => ({
            ...d,
            guest_name: "",
            distributor_name: "",
            contact_name: "",
            account_name: "",
        }));
        setDistributorLabel("");
        setContactLabel("");
        setAccountLabel("");
    }, [draft.guest_type]);

    // Fetch callbacks
    const fetchDistributors = useCallback((search?: string) => api.getDistributorList(search, 20), []);
    const fetchContacts = useCallback((search?: string) => api.getContactList(search, 20), []);
    const fetchAccounts = useCallback((search?: string) => api.getAccountList(search, 20), []);

    const set = (field: keyof Tab3Draft, value: string) => {
        setDraft((d) => ({ ...d, [field]: value }));
        if (errors[field]) setErrors((e) => { const next = { ...e }; delete next[field]; return next; });
    };

    const handleAdd = () => {
        const validationErrors = validateTab3Draft(draft);
        if (validationErrors.length > 0) {
            setErrors(toErrorMap(validationErrors));
            return;
        }

        const entry: StayEntry = {
            guest_type: draft.guest_type as any,
            guest_name: draft.guest_type === "Others" ? draft.guest_name || undefined : undefined,
            distributor_name: draft.distributor_name || undefined,
            account_name: draft.account_name || undefined,
            contact_name: draft.contact_name || undefined,
            designation: draft.designation || undefined,
            check_in_date: toFrappeDatetime(draft.check_in_date) || "",
            check_out_date: toFrappeDatetime(draft.check_out_date) || "",
            repeat_guest: (draft.repeat_guest === "Yes" || draft.repeat_guest === "No") ? draft.repeat_guest : undefined,
            state: draft.state || undefined,
            country: draft.country || undefined,
            remark: draft.remark || undefined,
            is_food: 0,
            is_stay: 1,
            booking_for: "Club",
        };

        onAdd(entry);
        setDraft({ ...emptyDraft });
        setDistributorLabel("");
        setContactLabel("");
        setAccountLabel("");
        setErrors({});
    };

    // ── Helper: get display name ──
    const getDisplayName = (entry: StayEntry) => {
        if (entry.guest_type === "Others") return entry.guest_name || "—";
        if (entry.guest_type === "Distributor") return entry.guest_name || entry.distributor_name || "—";
        if (entry.guest_type === "Doctor") return entry.guest_name || entry.contact_name || "—";
        return entry.guest_name || entry.distributor_or_guest_name || "—";
    };

    const getHospitalAccount = (entry: StayEntry) => {
        return entry.account_name || entry.firm_or_hospital_name || "—";
    };

    // ── Guest type badge ──
    const getGuestTypeBadge = (guestType?: string) => {
        if (!guestType) return <span className="text-[#9ca3af]">—</span>;
        const config: Record<string, { bg: string; text: string }> = {
            Distributor: { bg: "bg-green-50", text: "text-green-700" },
            Doctor: { bg: "bg-blue-50", text: "text-blue-700" },
            Others: { bg: "bg-gray-100", text: "text-gray-600" },
        };
        const c = config[guestType] || { bg: "bg-gray-100", text: "text-gray-600" };
        return (
            <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${c.bg} ${c.text}`}>
                {guestType}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">

                {/* ── Guest Type Select ── */}
                <Field label="Guest Type" required error={errors.guest_type}>
                    <Select value={draft.guest_type} onValueChange={(v) => set("guest_type", v)}>
                        <SelectTrigger className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]">
                            <SelectValue placeholder="Select Guest Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Distributor">
                                <span className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-green-600" /> Distributor</span>
                            </SelectItem>
                            <SelectItem value="Doctor">
                                <span className="flex items-center gap-2"><Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Doctor</span>
                            </SelectItem>
                            <SelectItem value="Others">
                                <span className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-gray-500" /> Others</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                {/* ── Conditional fields based on Guest Type ── */}
                {draft.guest_type === "Distributor" && (
                    <>
                        <Field label="Distributor" required error={errors.distributor_name}>
                            <MasterDataSelect
                                value={draft.distributor_name}
                                displayLabel={distributorLabel}
                                onChange={(val, label) => { set("distributor_name", val); setDistributorLabel(label); }}
                                fetchOptions={fetchDistributors}
                                onAddNew={() => setShowAddDistributor(true)}
                                addNewLabel="+ Add New Distributor"
                                placeholder="Search Distributor"
                                searchPlaceholder="Search distributor..."
                                emptyMessage="No distributors found"
                                icon={<Building2 className="w-4 h-4 text-green-500" />}
                            />
                        </Field>
                        <Field label="Hospital / Account" error={errors.account_name}>
                            <MasterDataSelect
                                value={draft.account_name}
                                displayLabel={accountLabel}
                                onChange={(val, label) => { set("account_name", val); setAccountLabel(label); }}
                                fetchOptions={fetchAccounts}
                                onAddNew={() => setShowAddAccount(true)}
                                addNewLabel="+ Add New Account"
                                placeholder="Search Hospital/Account"
                                searchPlaceholder="Search account..."
                                emptyMessage="No accounts found"
                            />
                        </Field>
                    </>
                )}

                {draft.guest_type === "Doctor" && (
                    <>
                        <Field label="Doctor / Contact" required error={errors.contact_name}>
                            <MasterDataSelect
                                value={draft.contact_name}
                                displayLabel={contactLabel}
                                onChange={(val, label) => { set("contact_name", val); setContactLabel(label); }}
                                fetchOptions={fetchContacts}
                                onAddNew={() => setShowAddContact(true)}
                                addNewLabel="+ Add New Contact"
                                placeholder="Search Doctor/Contact"
                                searchPlaceholder="Search contact..."
                                emptyMessage="No contacts found"
                                icon={<Stethoscope className="w-4 h-4 text-blue-500" />}
                            />
                        </Field>
                        <Field label="Hospital / Account" error={errors.account_name}>
                            <MasterDataSelect
                                value={draft.account_name}
                                displayLabel={accountLabel}
                                onChange={(val, label) => { set("account_name", val); setAccountLabel(label); }}
                                fetchOptions={fetchAccounts}
                                onAddNew={() => setShowAddAccount(true)}
                                addNewLabel="+ Add New Account"
                                placeholder="Auto-fetched / Search"
                                searchPlaceholder="Search account..."
                                emptyMessage="No accounts found"
                            />
                        </Field>
                    </>
                )}

                {draft.guest_type === "Others" && (
                    <Field label="Guest Name" required error={errors.guest_name}>
                        <Input placeholder="Enter Guest Name" value={draft.guest_name}
                            onChange={(e) => set("guest_name", e.target.value)}
                            className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                    </Field>
                )}

                {/* Common fields — show when guest type is selected */}
                {draft.guest_type && (
                    <>
                        <Field label="Designation" error={errors.designation}>
                            <Input placeholder="Enter Designation" value={draft.designation}
                                onChange={(e) => set("designation", e.target.value)}
                                className="h-[42px] border-2 border-[#e5e7eb] rounded-[8px]" />
                        </Field>

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

                        {/* Remark + Add button */}
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
                    </>
                )}
            </div>

            {/* Stay Entries Table */}
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-3 mb-2 border-b border-[#e5e7eb] pb-2">
                    <div className="bg-[#ffedd4] text-orange-500 p-1.5 rounded-[8px]">
                        <BedDouble className="w-5 h-5" />
                    </div>
                    <h3 className="text-[18px] font-medium text-[#101828]">Stay List</h3>
                    <span className="ml-auto text-[13px] text-[#6a7282]">{entries.length} entries</span>
                </div>

                {entries.length === 0 ? (
                    <div className="border border-dashed border-[#e5e7eb] rounded-[16px] py-10 text-center text-[#adadad] text-[14px]">
                        No stay entries yet. Fill the form above and click <b>+</b> to add.
                    </div>
                ) : (
                    <div className="border border-[#e5e7eb] rounded-[16px] overflow-hidden shadow-sm overflow-x-auto">
                        <Table className="whitespace-nowrap min-w-[1200px]">
                            <TableHeader className="bg-[#f8f9fa]">
                                <TableRow>
                                    <TableHead className="font-medium text-[#364153]">Guest Type</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Guest Name</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Hospital/Account</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Designation</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Check-in</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Check-out</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Repeat</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Country</TableHead>
                                    <TableHead className="font-medium text-[#364153]">State</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Remark</TableHead>
                                    <TableHead className="font-medium text-[#364153]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry, idx) => (
                                    <TableRow key={entry.name || String(idx)} className="bg-white">
                                        <TableCell>{getGuestTypeBadge(entry.guest_type)}</TableCell>
                                        <TableCell className="text-[#6a7282] font-medium">{getDisplayName(entry)}</TableCell>
                                        <TableCell className="text-[#6a7282] max-w-[200px] truncate" title={getHospitalAccount(entry)}>{getHospitalAccount(entry)}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.designation || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.check_in_date ? formatDisplayDate(entry.check_in_date) : "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.check_out_date ? formatDisplayDate(entry.check_out_date) : "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.repeat_guest || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.country || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.state || "-"}</TableCell>
                                        <TableCell className="text-[#6a7282]">{entry.remark || "-"}</TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() => entry.name && onRemove(entry.name)}
                                                className="cursor-pointer text-red-500 hover:text-red-50 transition-colors"
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

            {/* ── Add New Dialogs ── */}
            <AddDistributorDialog
                open={showAddDistributor}
                onClose={() => setShowAddDistributor(false)}
                onCreated={(opt) => { set("distributor_name", opt.value); setDistributorLabel(opt.label); }}
            />
            <AddContactDialog
                open={showAddContact}
                onClose={() => setShowAddContact(false)}
                onCreated={(opt) => { set("contact_name", opt.value); setContactLabel(opt.label); }}
            />
            <AddAccountDialog
                open={showAddAccount}
                onClose={() => setShowAddAccount(false)}
                onCreated={(opt) => { set("account_name", opt.value); setAccountLabel(opt.label); }}
            />
        </div>
    );
}
