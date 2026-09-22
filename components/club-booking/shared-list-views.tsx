import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { formatDisplayDate } from "@/lib/date-utils";

export const getGuestTypeBadge = (guestType: string) => {
    if (!guestType) return <span className="text-gray-400">—</span>;
    const colorClass = guestType === "Doctor" ? "bg-blue-50 text-blue-700" :
        guestType === "Distributor" ? "bg-purple-50 text-purple-700" :
            "bg-gray-100 text-gray-700";
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>{guestType}</span>;
};

export const getDisplayName = (entry: any) => {
    if (entry.guest_type === "Others") return entry.guest_name || "—";
    if (entry.guest_type === "Distributor") return entry.guest_name || entry.distributor_name || "—";
    if (entry.guest_type === "Doctor") return entry.guest_name || entry.contact_name || "—";
    return entry.guest_name || entry.distributor_or_guest_name || "—";
};

export const getHospitalAccount = (entry: any) => {
    return entry.account_name || entry.firm_or_hospital_name || "—";
};

interface ListViewProps {
    entries: any[];
    onRemove?: (name: string) => void;
    showDelete?: boolean;
}

export function StayListView({ entries, onRemove, showDelete = true }: ListViewProps) {
    if (!entries || entries.length === 0) {
        return (
            <div className="border border-dashed border-[#e5e7eb] rounded-[16px] py-10 text-center text-[#adadad] text-[14px]">
                No stay entries yet. Fill the form above and click <b>+</b> to add.
            </div>
        );
    }

    return (
        <>
            <div className="hidden md:block border border-[#e5e7eb] rounded-[16px] overflow-hidden shadow-sm overflow-x-auto">
                <Table className="whitespace-nowrap min-w-[1200px]">
                    <TableHeader className="bg-[#f8f9fa]">
                        <TableRow>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Guest Type</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Guest Name</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Designation</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Organization</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">State/Country</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Check-In</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Check-Out</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Stay Type</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Repeat</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Remark</TableHead>
                            {showDelete && <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Action</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map((entry, idx) => (
                            <TableRow key={entry.name || String(idx)} className="bg-white">
                                <TableCell>{getGuestTypeBadge(entry.guest_type)}</TableCell>
                                <TableCell className="text-[#101828] font-bold">{getDisplayName(entry)}</TableCell>
                                <TableCell className="text-[#6a7282]">{entry.designation || "-"}</TableCell>
                                <TableCell className="text-[#6a7282] max-w-[200px] truncate" title={getHospitalAccount(entry)}>{getHospitalAccount(entry)}</TableCell>
                                <TableCell className="text-[#6a7282]">
                                    {entry.state ? `${entry.state}, ` : ""}{entry.country || "-"}
                                </TableCell>
                                <TableCell className="text-[#101828] font-medium">{entry.check_in_date ? formatDisplayDate(entry.check_in_date) : "-"}</TableCell>
                                <TableCell className="text-[#101828] font-medium">{entry.check_out_date ? formatDisplayDate(entry.check_out_date) : "-"}</TableCell>
                                <TableCell>{getStayTypeBadge(entry)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${entry.repeat_guest === "Yes" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {entry.repeat_guest || "No"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-[#6a7282] italic max-w-[150px] truncate" title={entry.remark || ""}>{entry.remark || "-"}</TableCell>
                                {showDelete && (
                                    <TableCell>
                                        <button
                                            type="button"
                                            onClick={() => entry.name && onRemove?.(entry.name)}
                                            className="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
                                            title="Remove entry"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Mobile Stacked View */}
            <div className="md:hidden space-y-3 mt-2">
                {entries.map((stay: any, idx: number) => {
                    let nights = "— nights";
                    if (stay.check_in_date && stay.check_out_date) {
                        try {
                            const cin = new Date(stay.check_in_date);
                            const cout = new Date(stay.check_out_date);
                            const diffTime = Math.abs(cout.getTime() - cin.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            nights = `${diffDays} night${diffDays > 1 ? 's' : ''}`;
                        } catch { }
                    }
                    return (
                        <div key={stay.name || String(idx)} className="border border-[#EAECF0] rounded-xl p-4 bg-white shadow-sm relative">
                            {showDelete && (
                                <button
                                    type="button"
                                    onClick={() => stay.name && onRemove?.(stay.name)}
                                    className="cursor-pointer absolute top-4 right-4 w-8 h-8 rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] flex items-center justify-center transition-colors hover:bg-red-100"
                                    title="Remove entry"
                                >
                                    <Trash2 className="w-4 h-4 text-[#D92D20]" />
                                </button>
                            )}
                            <div className="flex justify-between items-start pb-4 pr-10">
                                <div className="flex flex-col">
                                    <span className="font-bold text-[#101828] text-[16px] truncate max-w-[200px]">{getDisplayName(stay)}</span>
                                    <span className="text-[#667085] text-[12px] mt-1">
                                        {stay.check_in_date ? formatDisplayDate(stay.check_in_date) : "—"} - {stay.check_out_date ? formatDisplayDate(stay.check_out_date) : "—"} · {nights}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-3 border-t border-[#EAECF0]">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Guest Type</span>
                                    <div>{getGuestTypeBadge(stay.guest_type)}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Organization</span>
                                    <span className="text-[#101828] font-medium text-[13px]">{getHospitalAccount(stay)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Designation</span>
                                    <span className="text-[#101828] font-medium text-[13px]">{stay.designation || "—"}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">State/Country</span>
                                    <span className="text-[#101828] font-medium text-[13px]">
                                        {stay.state ? `${stay.state}, ` : ""}{stay.country || "-"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Stay Type</span>
                                    <div>{getStayTypeBadge(stay)}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Repeat</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-max ${stay.repeat_guest === "Yes" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {stay.repeat_guest || "No"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 col-span-2">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Remark</span>
                                    <span className="text-[#101828] italic text-[13px] max-w-full truncate pr-2">{stay.remark || "—"}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export const getStayTypeBadge = (item: any) => {
    const isStay = item.is_stay;
    const isFood = item.is_food;
    if (isStay && isFood) return <span className="bg-purple-50 text-[#7D3FD0] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Stay + Food</span>;
    if (isStay) return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Stay</span>;
    if (isFood) return <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Food</span>;
    return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">None</span>;
};

export function DayWiseListView({ entries, onRemove, showDelete = true }: ListViewProps) {
    if (!entries || entries.length === 0) {
        return (
            <div className="border border-dashed border-[#e5e7eb] rounded-[16px] py-10 text-center text-[#adadad] text-[14px]">
                No entries yet. Fill the form above and click <b>+</b> to add.
            </div>
        );
    }

    return (
        <>
            <div className="hidden md:block border border-[#e5e7eb] rounded-[16px] overflow-hidden shadow-sm overflow-x-auto">
                <Table className="whitespace-nowrap min-w-[1400px]">
                    <TableHeader className="bg-[#f8f9fa]">
                        <TableRow>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Booking For</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Day</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Guest Type</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Guest Name</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Total Guests</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Designation</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Firm/Hospital</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Repeat Guest</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">State</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Country</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Food Pref.</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Meal Type</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Veg</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Non-Veg</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Jain</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Other</TableHead>
                            <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Remark</TableHead>
                            {showDelete && <TableHead className="font-bold text-[#364153] text-[10px] tracking-widest capitalize">Action</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map((entry, idx) => (
                            <TableRow key={entry.name || String(idx)} className="bg-white h-14 hover:bg-slate-50 transition-colors">
                                <TableCell className="text-[#6a7282] font-medium">{entry.booking_for || "-"}</TableCell>
                                <TableCell className="text-[#101828] font-bold text-nowrap">{entry.day ? entry.day.split(", ").map((d: string) => formatDisplayDate(d)).join(", ") : "-"}</TableCell>
                                <TableCell>{getGuestTypeBadge(entry.guest_type)}</TableCell>
                                <TableCell className="text-[#101828] font-bold">{getDisplayName(entry)}</TableCell>
                                <TableCell className="font-bold text-green-700 text-center">{entry.total_no_of_guest || "0"}</TableCell>
                                <TableCell className="text-[#6a7282]">{entry.designation || "-"}</TableCell>
                                <TableCell className="text-[#6a7282] max-w-[200px] truncate" title={entry.account_name || "-"}>{entry.account_name || "-"}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${entry.repeat_guest === "Yes" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {entry.repeat_guest || "No"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-[#6a7282]">{entry.state || "-"}</TableCell>
                                <TableCell className="text-[#6a7282]">{entry.country || "-"}</TableCell>
                                <TableCell className="text-[#6a7282]">{entry.food_preferences || "-"}</TableCell>
                                <TableCell>
                                    <span className="bg-green-50 text-blue-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                                        {entry.meal_type || "-"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-green-600 font-bold text-center">{entry.veg || "0"}</TableCell>
                                <TableCell className="text-red-600 font-bold text-center">{entry.non_veg || "0"}</TableCell>
                                <TableCell className="text-orange-600 font-bold text-center">{entry.jain || "0"}</TableCell>
                                <TableCell className="text-gray-600 font-bold text-center">{entry.other || "0"}</TableCell>
                                <TableCell className="text-[#6a7282] max-w-[150px] truncate italic" title={entry.remark || ""}>{entry.remark || "test"}</TableCell>
                                {showDelete && (
                                    <TableCell>
                                        <button
                                            type="button"
                                            onClick={() => entry.name && onRemove?.(entry.name)}
                                            className="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
                                            title="Remove entry"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Mobile Stacked View */}
            <div className="md:hidden space-y-3 mt-2">
                {entries.map((food: any, idx: number) => {
                    return (
                        <div key={food.name || String(idx)} className="border border-[#EAECF0] rounded-xl p-4 bg-white shadow-sm relative">
                            {showDelete && (
                                <button
                                    type="button"
                                    onClick={() => food.name && onRemove?.(food.name)}
                                    className="cursor-pointer absolute top-4 right-4 w-8 h-8 rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] flex items-center justify-center transition-colors hover:bg-red-100"
                                    title="Remove entry"
                                >
                                    <Trash2 className="w-4 h-4 text-[#D92D20]" />
                                </button>
                            )}
                            <div className="flex justify-between items-start pb-3 border-b border-[#EAECF0]">
                                <div className="flex items-center gap-2 pr-10">
                                    <span className="font-bold text-[#101828] text-[16px]">{getDisplayName(food)}</span>
                                    {getGuestTypeBadge(food.guest_type)}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-3 border-t border-[#EAECF0]">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Booking For</span>
                                    <span className="text-[#101828] font-medium text-[13px]">{food.booking_for || "—"}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Day</span>
                                    <span className="text-[#101828] font-medium text-[13px]">{food.day ? food.day.split(", ").map((d: string) => formatDisplayDate(d)).join(", ") : "-"}</span>
                                </div>
                                {food.booking_for !== "Academy" && (
                                    <>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Firm/Hospital</span>
                                            <span className="text-[#101828] font-medium text-[13px]">{getHospitalAccount(food)}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Designation</span>
                                            <span className="text-[#101828] font-medium text-[13px]">{food.designation || "—"}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Total Guests</span>
                                    <span className="text-green-700 font-bold text-[14px]">{food.total_no_of_guest || "0"}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Repeat Guest</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-max ${food.repeat_guest === "Yes" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {food.repeat_guest || "No"}
                                    </span>
                                </div>
                                {food.booking_for !== "Academy" && (
                                    <>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">State</span>
                                            <span className="text-[#101828] font-medium text-[13px]">{food.state || "—"}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Country</span>
                                            <span className="text-[#101828] font-medium text-[13px]">{food.country || "—"}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex flex-col gap-1 col-span-2">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Preference & Meal</span>
                                    <span className="text-[#101828] font-medium text-[13px]">
                                        {food.food_preferences || "—"} ({food.meal_type || "—"})
                                    </span>
                                </div>
                                {food.booking_for === "Academy" && (
                                    <div className="col-span-2 mt-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-500 text-[10px] tracking-widest uppercase font-extrabold">Meal Breakdown</span>
                                            <span className="text-slate-400 text-[10px] font-medium">Total: {food.total_no_of_guest || "0"}</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="flex flex-col items-center justify-center bg-white shadow-sm rounded-lg py-2 border border-green-100">
                                                <span className="text-[16px] font-black text-green-600 leading-none mb-1">{food.veg || "0"}</span>
                                                <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest">Veg</span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center bg-white shadow-sm rounded-lg py-2 border border-red-100">
                                                <span className="text-[16px] font-black text-red-600 leading-none mb-1">{food.non_veg || "0"}</span>
                                                <span className="text-[9px] font-bold text-red-700 uppercase tracking-widest">Non-Veg</span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center bg-white shadow-sm rounded-lg py-2 border border-orange-100">
                                                <span className="text-[16px] font-black text-orange-600 leading-none mb-1">{food.jain || "0"}</span>
                                                <span className="text-[9px] font-bold text-orange-700 uppercase tracking-widest">Jain</span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center bg-white shadow-sm rounded-lg py-2 border border-gray-100">
                                                <span className="text-[16px] font-black text-gray-600 leading-none mb-1">{food.other || "0"}</span>
                                                <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Other</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col gap-1 col-span-2">
                                    <span className="text-[#667085] text-[10px] tracking-wider capitalize font-bold">Remark</span>
                                    <span className="text-[#101828] italic text-[13px] max-w-full truncate pr-2">{food.remark || "—"}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
