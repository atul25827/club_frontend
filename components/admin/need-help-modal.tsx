"use client";

import { HelpCircle, Phone, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/services/api";

interface Contact {
    department: string;
    contact_type: string;
    contact_value: string;
    label: string;
    is_primary: number;
    display_order: number;
}

export function NeedHelpModal({ isMobile = false }: { isMobile?: boolean }) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchContacts = async () => {
        if (contacts.length > 0) return;

        try {
            setLoading(true);
            const response = await api.getHelpSupportSettings("Club");
            if (response?.status === "success" && response.data?.contacts) {
                setContacts(response.data.contacts);
            }
        } catch (error) {
            console.error("Error fetching support contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            fetchContacts();
        }
    };

    // Group contacts by department
    const departments = Array.from(new Set(contacts.map(c => c.department)));

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {isMobile ? (
                    <button
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group w-full text-[#475467] hover:bg-slate-100 font-medium cursor-pointer border border-transparent"
                    >
                        <HelpCircle className="h-5 w-5 text-[#94A3B8] group-hover:text-[#33398A]" />
                        <span className="text-[15px] group-hover:text-[#33398A]">Need Help</span>
                    </button>
                ) : (
                    <button
                        className="flex flex-col items-center justify-center p-3 rounded-[12px] w-[70px] h-[70px] text-[#5A5A5A] hover:bg-white/50 transition-all duration-200 mt-auto group cursor-pointer"
                    >
                        <HelpCircle className="h-6 w-6 mb-1 text-[#5A5A5A] group-hover:text-[#33398A]" />
                        <span className="text-[10px] font-medium text-center leading-tight group-hover:text-[#33398A]">Need Help</span>
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[780px] p-5 gap-5 rounded-[12px] bg-white shadow-[0_18px_48px_-8px_rgba(15,23,42,0.18)] border-none max-sm:w-full max-sm:bottom-0 max-sm:translate-y-0 max-sm:top-auto max-sm:rounded-b-none max-sm:rounded-t-[24px]">
                <div className="mx-auto w-12 h-1 bg-gray-200 rounded-full sm:hidden absolute top-3 left-1/2 -translate-x-1/2" />
                <DialogHeader className="flex flex-col items-start justify-between space-y-1.5 pb-0">
                    <DialogTitle className="text-[#0F172A] font-semibold text-lg">Need help?</DialogTitle>
                    <DialogDescription className="text-[#94A3B8] text-[13px]">
                        Contact the club admin team and we'll help you with your booking or membership.
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full h-px bg-[#E2E8F0]" />
                <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-sm text-[#94A3B8]">Loading contacts...</div>
                    ) : contacts.length === 0 ? (
                        <div className="text-sm text-[#94A3B8]">No support contacts available.</div>
                    ) : (
                        departments.map((dept) => {
                            const deptContacts = contacts.filter((c) => c.department === dept);
                            return (
                                <div key={dept} className="flex flex-col gap-3">
                                    <h4 className="text-[#0F172A] font-medium text-sm">{dept}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {deptContacts.map((contact, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-[#12A66A]/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    {contact.contact_type.toLowerCase() === "phone" ? (
                                                        <Phone className="w-4 h-4 text-[#12A66A]" />
                                                    ) : (
                                                        <Mail className="w-4 h-4 text-[#12A66A]" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[#94A3B8] text-xs">
                                                        {contact.label || contact.contact_type}
                                                    </span>
                                                    <span className="text-[#0F172A] text-[12px] sm:text-[12px] md:text-sm font-medium whitespace-nowrap">
                                                        {contact.contact_value}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
