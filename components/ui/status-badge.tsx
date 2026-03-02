import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const getBadgeStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return "bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]";
            case "cancelled":
                return "text-orange-600 bg-orange-50 border-orange-100";
            case "rejected":
                return "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]";
            case "pending":
                return "bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]";
            case "upcoming":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "completed":
                return "bg-slate-100 text-slate-700 border-slate-200";
            case "attendence submitted":
                return "bg-blue-50 text-blue-700 border-blue-200";
            default:
                return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    return (
        <span className={cn(
            "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            getBadgeStyle(status),
            className
        )}>
            {status || "Unknown"}
        </span>
    );
}
