"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Check, Search, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { toast } from "sonner";
import type { MasterDataOption, City, LookupItem } from "@/types";

// ─── Field Helper ─────────────────────────────────────────────────────────────

function FormField({ label, required, children }: {
    label: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-[#364153] font-medium text-[13px]">
                {label} {required && <span className="text-[#fb2c36]">*</span>}
            </Label>
            {children}
        </div>
    );
}

const inputClass = "h-[40px] border border-[#e5e7eb] rounded-[8px] text-sm focus:border-[#7D3FD0] focus:ring-1 focus:ring-[#7D3FD0]/20";

// ─── Inline Account Select for Contact Form ──────────────────────────────────

function InlineAccountSelect({ value, onChange }: {
    value: string; onChange: (val: string, label: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState<MasterDataOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchOptions = useCallback((term?: string) => {
        setIsLoading(true);
        api.getAccountList(term, 20).then(setOptions).finally(() => setIsLoading(false));
    }, []);

    useEffect(() => { fetchOptions(); }, [fetchOptions]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
        else setSearch("");
    }, [open]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchOptions(val), 300);
    };

    // ── "Add New Account" sub-dialog ──
    const [showAddAccount, setShowAddAccount] = useState(false);

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button type="button" className={cn(
                        "flex h-[40px] w-full items-center justify-between rounded-[8px] border border-[#e5e7eb] bg-white px-3 py-2 text-sm",
                        "transition-all focus:outline-none focus:border-[#7D3FD0]",
                        open && "border-[#7D3FD0] ring-1 ring-[#7D3FD0]/20"
                    )} aria-expanded={open}>
                        <span className={cn("truncate", selectedLabel ? "text-[#101828] font-medium" : "text-[#9ca3af]")}>
                            {selectedLabel || "Select Account"}
                        </span>
                        <ChevronDown className={cn("w-4 h-4 text-[#6a7282] transition-transform", open && "rotate-180")} />
                    </button>
                </PopoverTrigger>
                <PopoverContent align="start" sideOffset={4} className="p-0 shadow-lg border border-[#e5e7eb] rounded-lg overflow-hidden" style={{ width: "var(--radix-popover-trigger-width)", minWidth: "220px" }}>
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0] bg-[#faf8ff]">
                        <Search className="w-4 h-4 text-[#9ca3af]" />
                        <input ref={inputRef} value={search} onChange={handleSearch} placeholder="Search account..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]" />
                    </div>
                    <div className="max-h-[180px] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4 text-sm text-[#9ca3af]"><span className="animate-pulse">Loading...</span></div>
                        ) : options.length === 0 ? (
                            <div className="py-4 text-center text-sm text-[#9ca3af]">No accounts found</div>
                        ) : (
                            options.map(opt => (
                                <button key={opt.value} type="button" onClick={() => { onChange(opt.value, opt.label); setSelectedLabel(opt.label); setOpen(false); }}
                                    className={cn("flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-[#f8f5ff]", opt.value === value && "bg-[#faf7ff] text-[#7D3FD0]")}>
                                    <span className="truncate">{opt.label}</span>
                                    {opt.value === value && <Check className="w-3.5 h-3.5 text-[#7D3FD0]" />}
                                </button>
                            ))
                        )}
                    </div>
                    <button type="button" onClick={() => { setOpen(false); setShowAddAccount(true); }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[#7D3FD0] hover:bg-[#f8f5ff] border-t border-[#f0f0f0] sticky bottom-0 bg-white">
                        <Plus className="w-4 h-4" /> Add New Account
                    </button>
                </PopoverContent>
            </Popover>
            <AddAccountDialog open={showAddAccount} onClose={() => setShowAddAccount(false)}
                onCreated={(opt) => { onChange(opt.value, opt.label); setSelectedLabel(opt.label); }} />
        </>
    );
}

// ─── Add Account Dialog ───────────────────────────────────────────────────────

function AddAccountDialog({ open, onClose, onCreated }: {
    open: boolean; onClose: () => void; onCreated: (opt: MasterDataOption) => void;
}) {
    const [form, setForm] = useState({ account_name: "", address: "", account_code: "", district: "", customer_type: "", city: "" });
    const [saving, setSaving] = useState(false);

    const [cities, setCities] = useState<City[]>([]);
    const [customerTypes, setCustomerTypes] = useState<LookupItem[]>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    useEffect(() => {
        if (open) {
            api.getClubMasterData().then(data => {
                if (data?.customer_type) setCustomerTypes(data.customer_type);
            });
            setIsLoadingCities(true);
            api.getCities().then(setCities).finally(() => setIsLoadingCities(false));
        }
    }, [open]);

    const handleCitySearch = useCallback((term: string) => {
        setIsLoadingCities(true);
        api.getCities(term || undefined).then(setCities).finally(() => setIsLoadingCities(false));
    }, []);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.account_name.trim()) { toast.error("Account name is required"); return; }
        if (!form.address.trim()) { toast.error("Address is required"); return; }
        setSaving(true);
        try {
            const result = await api.saveAccount(form);
            if (result) {
                toast.success("Account created successfully");
                onCreated(result);
                onClose();
                setForm({ account_name: "", address: "", account_code: "", district: "", customer_type: "", city: "" });
            }
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to create account");
        } finally { setSaving(false); }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[520px] rounded-xl border border-gray-200 p-0">
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-[#101828] flex items-center gap-2">
                            <div className="p-1.5 bg-purple-50 rounded-lg"><Plus className="w-4 h-4 text-[#7D3FD0]" /></div>
                            Add New Account
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 mt-5">
                        <FormField label="Account Name" required>
                            <Input value={form.account_name} onChange={e => set("account_name", e.target.value)} placeholder="Enter account name" className={inputClass} />
                        </FormField>
                        <FormField label="Account Code">
                            <Input value={form.account_code} onChange={e => set("account_code", e.target.value)} placeholder="Code" className={inputClass} />
                        </FormField>
                        <FormField label="District">
                            <Input value={form.district} onChange={e => set("district", e.target.value)} placeholder="District" className={inputClass} />
                        </FormField>
                        <FormField label="Customer Type">
                            <Select value={form.customer_type} onValueChange={v => set("customer_type", v)}>
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customerTypes.map(type => (
                                        <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="City">
                            <SearchableSelect 
                                options={cities} 
                                value={form.city} 
                                onChange={v => set("city", v)}
                                onSearch={handleCitySearch}
                                placeholder="Select City" 
                                searchPlaceholder="Search city..."
                                emptyMessage="No cities found"
                                loadingMessage="Loading cities..."
                                isLoading={isLoadingCities}
                            />
                        </FormField>
                        <div className="col-span-2">
                            <FormField label="Address" required>
                                <textarea value={form.address} onChange={e => set("address", e.target.value)} placeholder="Enter full address" className={cn(inputClass, "min-h-[80px] py-2 resize-none")} />
                            </FormField>
                        </div>
                    </div>
                    <DialogFooter className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={saving} className="cursor-pointer h-9 px-4 text-sm rounded-lg">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="cursor-pointer h-9 px-5 text-sm bg-[#7D3FD0] hover:bg-[#6a2eb8] text-white rounded-lg">
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</> : "Save Account"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Add Contact Dialog ───────────────────────────────────────────────────────

export function AddContactDialog({ open, onClose, onCreated }: {
    open: boolean; onClose: () => void; onCreated: (opt: MasterDataOption) => void;
}) {
    const [form, setForm] = useState({ contact_name: "", account: "", contact_code: "", custom_name: "" });
    const [accountLabel, setAccountLabel] = useState("");
    const [saving, setSaving] = useState(false);
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.contact_name.trim()) { toast.error("Contact name is required"); return; }
        setSaving(true);
        try {
            const result = await api.saveContact(form);
            if (result) {
                toast.success("Contact created successfully");
                onCreated(result);
                onClose();
                setForm({ contact_name: "", account: "", contact_code: "", custom_name: "" });
                setAccountLabel("");
            }
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to create contact");
        } finally { setSaving(false); }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[520px] rounded-xl border border-gray-200 p-0">
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-[#101828] flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 rounded-lg"><Plus className="w-4 h-4 text-blue-600" /></div>
                            Add New Contact
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 mt-5">
                        <FormField label="Contact Name" required>
                            <Input value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="Enter contact name" className={inputClass} />
                        </FormField>
                        <FormField label="Account (Link)">
                            <InlineAccountSelect value={form.account} onChange={(val, label) => { set("account", val); setAccountLabel(label); }} />
                        </FormField>
                        <FormField label="Contact Code">
                            <Input value={form.contact_code} onChange={e => set("contact_code", e.target.value)} placeholder="Code" className={inputClass} />
                        </FormField>
                        {/* <FormField label="Custom Name">
                            <Input value={form.custom_name} onChange={e => set("custom_name", e.target.value)} placeholder="Custom name" className={inputClass} />
                        </FormField> */}
                    </div>
                    <DialogFooter className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={saving} className="cursor-pointer h-9 px-4 text-sm rounded-lg">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="cursor-pointer h-9 px-5 text-sm bg-[#7D3FD0] hover:bg-[#6a2eb8] text-white rounded-lg">
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</> : "Save Contact"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Add Distributor Dialog ───────────────────────────────────────────────────

export function AddDistributorDialog({ open, onClose, onCreated }: {
    open: boolean; onClose: () => void; onCreated: (opt: MasterDataOption) => void;
}) {
    const [form, setForm] = useState({ distributor_name: "", distributor_code: "", email: "", billing_address: "", city: "" });
    const [saving, setSaving] = useState(false);

    const [cities, setCities] = useState<City[]>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    useEffect(() => {
        if (open) {
            setIsLoadingCities(true);
            api.getCities().then(setCities).finally(() => setIsLoadingCities(false));
        }
    }, [open]);

    const handleCitySearch = useCallback((term: string) => {
        setIsLoadingCities(true);
        api.getCities(term || undefined).then(setCities).finally(() => setIsLoadingCities(false));
    }, []);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.distributor_name.trim()) { toast.error("Distributor name is required"); return; }
        setSaving(true);
        try {
            const result = await api.saveDistributor(form);
            if (result) {
                toast.success("Distributor created successfully");
                onCreated(result);
                onClose();
                setForm({ distributor_name: "", distributor_code: "", email: "", billing_address: "", city: "" });
            }
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to create distributor");
        } finally { setSaving(false); }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[520px] rounded-xl border border-gray-200 p-0">
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-[#101828] flex items-center gap-2">
                            <div className="p-1.5 bg-green-50 rounded-lg"><Plus className="w-4 h-4 text-green-600" /></div>
                            Add New Distributor
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 mt-5">
                        <FormField label="Distributor Name" required>
                            <Input value={form.distributor_name} onChange={e => set("distributor_name", e.target.value)} placeholder="Enter distributor name" className={inputClass} />
                        </FormField>
                        <FormField label="Distributor Code">
                            <Input value={form.distributor_code} onChange={e => set("distributor_code", e.target.value)} placeholder="Code" className={inputClass} />
                        </FormField>
                        <FormField label="Email">
                            <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" className={inputClass} />
                        </FormField>
                        <FormField label="City">
                            <SearchableSelect 
                                options={cities} 
                                value={form.city} 
                                onChange={v => set("city", v)}
                                onSearch={handleCitySearch}
                                placeholder="Select City" 
                                searchPlaceholder="Search city..."
                                emptyMessage="No cities found"
                                loadingMessage="Loading cities..."
                                isLoading={isLoadingCities}
                            />
                        </FormField>
                        <div className="col-span-2">
                            <FormField label="Billing Address">
                                <textarea value={form.billing_address} onChange={e => set("billing_address", e.target.value)} placeholder="Enter billing address" className={cn(inputClass, "min-h-[80px] py-2 resize-none")} />
                            </FormField>
                        </div>
                    </div>
                    <DialogFooter className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={saving} className="cursor-pointer h-9 px-4 text-sm rounded-lg">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="cursor-pointer h-9 px-5 text-sm bg-[#7D3FD0] hover:bg-[#6a2eb8] text-white rounded-lg">
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</> : "Save Distributor"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Export AddAccountDialog for external use ─────────────────────────────────
export { AddAccountDialog };
