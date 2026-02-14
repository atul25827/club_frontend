"use client";

import * as React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, ChevronsUpDown, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MasterData, Academy } from "@/types";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface BookingFormProps {
    academyId?: string;
    masterData: MasterData | null;
    academies: Academy[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

const FormLabel = ({ label, required = true }: { label: string; required?: boolean }) => (
    <Label className="text-[#767676] text-[20px] font-normal">
        {label} {required && <span className="text-red-500">*</span>}
    </Label>
);

export function BookingForm({ academyId, masterData, academies, onSuccess, onCancel }: BookingFormProps) {
    const router = useRouter();

    const { user } = useAuth();

    // Consolidated form state for better management and fewer re-renders
    const [formData, setFormData] = React.useState({
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
        academy: academyId || "",
        merilianCode: "",
        fullName: "",
        contactNumber: "",
        email: "",
        attendeesVertical: "",
        attendeesDepartment: "",
        trainingTitle: "",
        description: "",
        numberOfParticipants: "",
        no_of_participants_international: "",
        itRequirements: "",
        specificRequirements: "",
        matsEvent: "",
        matsRequestNo: "",
        event_type: "",
        comment: "",
    });

    React.useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                merilianCode: user.employeeCode || "",
                fullName: user.name || "",
                email: user.email || prev.email // Also mapping email as it's common
            }));
        }
    }, [user]);

    // Consolidated session state
    const [sessionState, setSessionState] = React.useState({
        list: [] as any[],
        draft: {
            trainingHall: [] as string[],
            bookingType: "",
            startTime: "",
            endTime: "",
            eventDate: undefined as Date | undefined,
        }
    });

    const [errors, setErrors] = React.useState<Record<string, string>>({});

    // Memoized derived state
    const availableHalls = React.useMemo(() => {
        const selectedAc = academies.find(a => a.id === formData.academy);
        return selectedAc?.halls || [];
    }, [formData.academy, academies]);

    const updateField = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const updateSessionDraft = (field: keyof typeof sessionState.draft, value: any) => {
        setSessionState(prev => ({
            ...prev,
            draft: { ...prev.draft, [field]: value }
        }));
        if (errors[`session.${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`session.${field}`];
                return newErrors;
            });
        }
    };

    const handleAddSession = () => {
        const { draft, list } = sessionState;
        if (!draft.eventDate || !draft.startTime || !draft.endTime || draft.trainingHall.length === 0 || !draft.bookingType) {
            setErrors(prev => ({ ...prev, "global.sessions": "Please fill all session details" }));
            return;
        }

        // Create a separate session for each selected hall to create multiple records
        const newSessions = draft.trainingHall.map(hallId => ({
            id: Math.random().toString(36).substr(2, 9),
            ...draft,
            trainingHall: hallId // Store as single ID per record
        }));

        setSessionState({
            list: [...list, ...newSessions],
            draft: {
                trainingHall: [],
                bookingType: "",
                startTime: "",
                endTime: "",
                eventDate: undefined,
            }
        });

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors["global.sessions"];
            return newErrors;
        });
    };

    const handleDeleteSession = (id: string) => {
        setSessionState(prev => ({
            ...prev,
            list: prev.list.filter(s => s.id !== id)
        }));
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        // Validation
        const requiredFields: (keyof typeof formData)[] = [
            "academy", "merilianCode", "fullName", "contactNumber",
            "email", "attendeesDepartment",
            "trainingTitle", "description", "numberOfParticipants",
            "itRequirements", "matsEvent"
        ];

        requiredFields.forEach(field => {
            if (!formData[field]) newErrors[field] = "Required";
        });

        if (formData.matsEvent === 'yes' && !formData.matsRequestNo) {
            newErrors["matsRequestNo"] = "Required";
        }
        if (!formData.startDate) newErrors["startDate"] = "Required";
        if (!formData.endDate) newErrors["endDate"] = "Required";

        if (sessionState.list.length === 0) {
            newErrors["global.sessions"] = "Add at least one Plan";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }

        // Structure data for submission
        const payload = {
            academy: formData.academy,
            department: formData.attendeesDepartment,
            vertical: formData.attendeesVertical,
            event_title: formData.trainingTitle,
            description: formData.description,
            event_start_date: formData.startDate ? format(formData.startDate, "yyyy-MM-dd") : "",
            event_end_date: formData.endDate ? format(formData.endDate, "yyyy-MM-dd") : "",
            no_of_participants: (formData.event_type === 'Domestic' || formData.event_type === 'Both' || !formData.event_type) ? Number(formData.numberOfParticipants) : 0,
            no_of_participants_international: (formData.event_type === 'International' || formData.event_type === 'Both') ? Number(formData.no_of_participants_international) : 0,
            it_requirement: formData.itRequirements,
            merilian_code: formData.merilianCode,
            full_name: formData.fullName,
            email: formData.email,
            contact_number: formData.contactNumber,
            mats_request_number: formData.matsEvent === "yes" ? formData.matsRequestNo : "",
            specific_requirement_if_any: formData.specificRequirements,
            mats_event: formData.matsEvent === "yes" ? "Yes" : "No",
            event_type: formData.event_type,
            comment: formData.comment,
            event_planning: sessionState.list.map(session => ({
                hall: Array.isArray(session.trainingHall) ? session.trainingHall.join(",") : session.trainingHall,
                booking_type: session.bookingType,
                event_date: session.eventDate ? format(session.eventDate, "yyyy-MM-dd") : "",
                event_start_time: session.startTime.length === 5 ? `${session.startTime}:00` : session.startTime,
                event_end_time: session.endTime.length === 5 ? `${session.endTime}:00` : session.endTime
            }))
        };

        try {
            toast.loading("Submitting booking...");
            await api.createBooking(payload);
            toast.dismiss();
            toast.success("Booking Submitted Successfully!");
            setErrors({});
            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/my-bookings");
            }
        } catch (error: any) {
            toast.dismiss();
            console.error("Booking submission error", error);
            toast.error(error.message || "Failed to submit booking");
        }
    };

    const renderError = (field: string) => {
        return errors[field] ? <span className="text-red-500 text-xs mt-1">{errors[field]}</span> : null;
    };

    return (
        <div className="space-y-8">
            {/* Hall Booking Information */}
            <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-[20px] font-normal text-[#271E4A] font-poppins ">Hall Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="px-0 grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Academy" />
                            <Select
                                value={formData.academy || ""}
                                onValueChange={(val) => updateField("academy", val)}
                            >
                                <SelectTrigger className="">
                                    <SelectValue className="" placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {academies.map((ac) => (
                                        <SelectItem key={ac.id} value={ac.id}>{ac.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {renderError("academy")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Merilian Code" />
                            <Input
                                value={formData.merilianCode}
                                readOnly
                                disabled
                                className="bg-muted text-muted-foreground"
                            />
                            {renderError("merilianCode")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Full Name" />
                            <Input
                                value={formData.fullName}
                                readOnly
                                disabled
                                className="bg-muted text-muted-foreground"
                            />
                            {renderError("fullName")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Contact Number" />
                            <Input
                                value={formData.contactNumber}
                                onChange={(e) => updateField("contactNumber", e.target.value)}
                                maxLength={13}
                            />
                            {renderError("contactNumber")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Email" />
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField("email", e.target.value)}
                            />
                            {renderError("email")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Event Type" />
                            <Select
                                value={formData.event_type || ""}
                                onValueChange={(val) => updateField("event_type", val)}
                            >
                                <SelectTrigger className="">
                                    <SelectValue className="" placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Domestic">Domestic</SelectItem>
                                    <SelectItem value="International">International</SelectItem>
                                    <SelectItem value="Both">Both</SelectItem>
                                </SelectContent>
                            </Select>
                            {renderError("event_type")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Attendees Vertical" />
                            <Select
                                value={formData.attendeesVertical}
                                onValueChange={(val) => updateField("attendeesVertical", val)}
                            >
                                <SelectTrigger className="bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    {masterData?.master_company.map((comp) => (
                                        <SelectItem key={comp.company_code} value={comp.company_code}>
                                            {comp.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {renderError("attendeesVertical")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Attendees Department" />
                            <Select
                                value={formData.attendeesDepartment}
                                onValueChange={(val) => updateField("attendeesDepartment", val)}
                            >
                                <SelectTrigger className="bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    {masterData?.department_master.map((dept) => (
                                        <SelectItem key={dept.name} value={dept.name}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {renderError("attendeesDepartment")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Training/Event Title" />
                            <Input
                                value={formData.trainingTitle}
                                onChange={(e) => updateField("trainingTitle", e.target.value)}
                            />
                            {renderError("trainingTitle")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Brief Description/Purpose" />
                            <Input
                                value={formData.description}
                                onChange={(e) => updateField("description", e.target.value)}
                            />
                            {renderError("description")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Event Start Date" />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal bg-background rounded-[6px]",
                                            !formData.startDate && "text-muted-foreground"
                                        )}
                                    >
                                        {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white border-[#BEBEBE]" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.startDate}
                                        onSelect={(date) => updateField("startDate", date)}
                                        initialFocus
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    />
                                </PopoverContent>
                            </Popover>
                            {renderError("startDate")}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Event End Date" />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal bg-background rounded-[6px]",
                                            !formData.endDate && "text-muted-foreground"
                                        )}
                                    >
                                        {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white border-[#BEBEBE]" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.endDate}
                                        onSelect={(date) => updateField("endDate", date)}
                                        initialFocus
                                        disabled={(date) => {
                                            const today = new Date(new Date().setHours(0, 0, 0, 0));
                                            if (date < today) return true;
                                            if (formData.startDate && date < formData.startDate) return true;
                                            return false;
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            {renderError("endDate")}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Day wise Plan */}
            <div className="space-y-4">
                <h3 className="text-[20px] font-normal text-[#271E4A] font-poppins ">Day wise Plan</h3>
                {renderError("global.sessions")}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 flex flex-col">
                        <FormLabel label="Training Hall" />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between bg-background font-normal",
                                        !sessionState.draft.trainingHall?.length && "text-muted-foreground"
                                    )}
                                >
                                    {sessionState.draft.trainingHall && sessionState.draft.trainingHall.length > 0
                                        ? (
                                            <span className="truncate">
                                                {sessionState.draft.trainingHall.map(id =>
                                                    availableHalls.find(h => h.id === id)?.name || id
                                                ).join(", ")}
                                            </span>
                                        )
                                        : "Select Halls"
                                    }
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0 bg-white" align="start">
                                <div className="border-b px-3 py-2">
                                    <p className="text-sm font-medium text-muted-foreground">Select Halls</p>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto p-1">
                                    {availableHalls.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">No halls available</div>
                                    ) : (
                                        <>
                                            {/* Select All Option */}
                                            <div
                                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground font-normal"
                                                onClick={() => {
                                                    const allHallIds = availableHalls.map(h => h.id);
                                                    const current = sessionState.draft.trainingHall || [];
                                                    // If all generated IDs are already selected, deselect all; otherwise, select all
                                                    const isAllSelected = allHallIds.every(id => current.includes(id));
                                                    updateSessionDraft("trainingHall", isAllSelected ? [] : allHallIds);
                                                }}
                                            >
                                                <div className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    (sessionState.draft.trainingHall?.length === availableHalls.length && availableHalls.length > 0) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                )}>
                                                    <svg
                                                        className="h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </div>
                                                <span>Select All</span>
                                            </div>

                                            {availableHalls.map((hall) => {
                                                const isSelected = (sessionState.draft.trainingHall || []).includes(hall.id);
                                                return (
                                                    <div
                                                        key={hall.id}
                                                        className={cn(
                                                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                                            isSelected ? "bg-accent/50" : ""
                                                        )}
                                                        onClick={() => {
                                                            const current = sessionState.draft.trainingHall || [];
                                                            const newValue = current.includes(hall.id)
                                                                ? current.filter((id: string) => id !== hall.id)
                                                                : [...current, hall.id];
                                                            updateSessionDraft("trainingHall", newValue);
                                                        }}
                                                    >
                                                        <div className={cn(
                                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                            isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                        )}>
                                                            <svg
                                                                className={cn("h-4 w-4")}
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        </div>
                                                        <span>{hall.name}</span>
                                                    </div>
                                                );
                                            })
                                            }
                                        </>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                        {renderError("session.trainingHall")}
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <FormLabel label="Booking Type" />
                        <Select
                            value={sessionState.draft.bookingType}
                            onValueChange={(val) => updateSessionDraft("bookingType", val)}
                        >
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                {masterData?.booking_type.map((bt) => (
                                    <SelectItem key={bt.name} value={bt.name}>{bt.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("session.bookingType")}
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <FormLabel label="Event Date" />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal bg-background rounded-[6px]",
                                        !sessionState.draft.eventDate && "text-muted-foreground"
                                    )}
                                >
                                    {sessionState.draft.eventDate ? format(sessionState.draft.eventDate, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white border-[#BEBEBE]" align="start">
                                <Calendar
                                    mode="single"
                                    selected={sessionState.draft.eventDate}
                                    onSelect={(date) => updateSessionDraft("eventDate", date)}
                                    initialFocus
                                    disabled={(date) => {
                                        // Optional: disable dates outside start/end range
                                        if (formData.startDate && date < formData.startDate) return true;
                                        if (formData.endDate && date > formData.endDate) return true;
                                        return false;
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        {renderError("session.eventDate")}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2 flex flex-col">
                        <FormLabel label="Event Start Time" />
                        <Input
                            type="time"
                            value={sessionState.draft.startTime}
                            onChange={(e) => updateSessionDraft("startTime", e.target.value)}
                        />
                        {renderError("session.startTime")}
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <FormLabel label="Event End Time" />
                        <Input
                            type="time"
                            value={sessionState.draft.endTime}
                            onChange={(e) => updateSessionDraft("endTime", e.target.value)}
                        />
                        {renderError("session.endTime")}
                    </div>
                    <Button onClick={handleAddSession} className="bg-[#7D3FD0] hover:bg-[#7D3FD0] text-white w-fit md:text-[20px] sm:[16px] cursor-pointer">
                        Add
                    </Button>
                </div>
            </div>

            {/* Event Planning Table */}
            {sessionState.list.length > 0 && (
                <div className="rounded-[24px] shadow-[0_4px_15px_0_rgba(216,210,252,0.64)]">
                    <div className="bg-muted/50 p-4">
                        <h4 className="text-[20px] font-normal text-[#271E4A] font-poppins py-1">Event Planning</h4>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="bg-[#EDF4FC] ">
                                    <tr className="transition-colors font-normal hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-2 align-middle font-normal text-muted-foreground rounded-l-[12px]">Training Hall</th>
                                        <th className="h-12 px-2 align-middle font-normal text-muted-foreground">Booking Type</th>
                                        <th className="h-12 px-2 align-middle font-normal text-muted-foreground">Event Date</th>
                                        <th className="h-12 px-2 align-middle font-normal text-muted-foreground">Start Time</th>
                                        <th className="h-12 px-2 align-middle font-normal text-muted-foreground">End Time</th>
                                        <th className="h-12 px-2 align-middle font-normal text-muted-foreground rounded-r-[12px]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {sessionState.list.map((session) => (
                                        <tr key={session.id} className="border-b border-[#BEBEBE] transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-2 align-middle">
                                                {(Array.isArray(session.trainingHall) ? session.trainingHall : [session.trainingHall]).map((hallId: string) =>
                                                    academies.flatMap(a => a.halls || []).find(h => h.id === hallId)?.name || hallId
                                                ).join(", ")}
                                            </td>
                                            <td className="p-2 align-middle">{session.bookingType}</td>
                                            <td className="p-2 align-middle">{session.eventDate ? format(session.eventDate, "dd-MM-yyyy") : "-"}</td>
                                            <td className="p-2 align-middle">{session.startTime}</td>
                                            <td className="p-2 align-middle">{session.endTime}</td>
                                            <td className="p-2 align-middle">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteSession(session.id)}
                                                    className="h-8 w-8 text-destructive cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Participants Form */}
            <div className="space-y-6">
                <h3 className="text-[20px] font-normal text-[#271E4A] font-poppins">Participants Form</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(formData.event_type === 'Domestic' || formData.event_type === 'Both') && (
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label={formData.event_type === 'Both' ? "Number of Participants (Domestic)" : "Number of Participants (Domestic)"} />
                            <Input
                                value={formData?.numberOfParticipants}
                                onChange={(e) => updateField("numberOfParticipants", e.target.value)}
                            />
                            {renderError("numberOfParticipants")}
                        </div>
                    )}
                    {(formData.event_type === 'International' || formData.event_type === 'Both') && (
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label={formData.event_type === 'Both' ? "Number of Participants (Int.)" : "Number of Participants (Int.)"} />
                            <Input
                                value={formData?.no_of_participants_international}
                                onChange={(e) => updateField("no_of_participants_international", e.target.value)}
                            />
                            {renderError("no_of_participants_international")}
                        </div>
                    )}
                    {(!formData.event_type) && (
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="Number of Participants" />
                            <Input
                                value={formData?.numberOfParticipants}
                                onChange={(e) => updateField("numberOfParticipants", e.target.value)}
                            />
                            {renderError("numberOfParticipants")}
                        </div>
                    )}
                    <div className="space-y-2 flex flex-col">
                        <FormLabel label="IT Requirements" />
                        <Select
                            value={formData.itRequirements}
                            onValueChange={(val) => updateField("itRequirements", val)}
                        >
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                {masterData?.it_requirements.map((it) => (
                                    <SelectItem key={it.name} value={it.name}>{it.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("itRequirements")}
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <FormLabel label="Specific Requirements, If any" required={false} />
                        <Input
                            value={formData.specificRequirements}
                            onChange={(e) => updateField("specificRequirements", e.target.value)}
                        />
                        {renderError("specificRequirements")}
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <FormLabel label="MATS Event" />
                        <Select
                            value={formData.matsEvent}
                            onValueChange={(val) => updateField("matsEvent", val)}
                        >
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                        {renderError("matsEvent")}
                    </div>
                    {formData.matsEvent === 'yes' && (
                        <div className="space-y-2 flex flex-col">
                            <FormLabel label="MATS Request No" />
                            <Input
                                value={formData.matsRequestNo}
                                onChange={(e) => updateField("matsRequestNo", e.target.value)}
                            />
                        </div>
                    )}
                    <div className="space-y-2 flex flex-col md:col-span-1">
                        <FormLabel label="Comment" required={false} />
                        <Input
                            value={formData.comment}
                            onChange={(e) => updateField("comment", e.target.value)}
                        />
                        {renderError("comment")}
                    </div>
                </div>

            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" size="lg" className="text-[20px]" onClick={onCancel || (() => router.back())}>Back</Button>
                <Button size="lg" className="bg-[#7D3FD0] hover:bg-[#7D3FD0] text-white text-[20px] cursor-pointer" onClick={handleSubmit}>Submit</Button>
            </div>
        </div>
    );
}
