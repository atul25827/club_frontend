export function BookingDetailsCard({ booking }: { booking: any }) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                <DetailItem label="Club Booking ID" value={booking?.name} />
                <DetailItem label="Event Name" value={booking?.event_name} />
                <DetailItem label="Guest Region" value={booking?.guest_region} />
                <DetailItem label="From Date" value={booking?.from_date} />
                <DetailItem label="To Date" value={booking?.to_date} />
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="font-medium text-gray-900">{value || "—"}</span>
        </div>
    );
}
