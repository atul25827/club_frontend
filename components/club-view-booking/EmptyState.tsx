import { Inbox } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="bg-white p-3 rounded-full text-gray-400 mb-4 shadow-sm border border-gray-100">
                <Inbox className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">{message}</p>
        </div>
    );
}
