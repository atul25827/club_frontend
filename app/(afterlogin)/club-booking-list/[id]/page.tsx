import { apiServer } from "@/services/api-server";
import { BookingDetailsView } from "@/components/club-booking/booking-details-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BookingDetailsPage({ params }: PageProps) {
    const { id } = await params;

    // Fetch booking details on server side with cookies
    const booking = await apiServer.getBookingDetails(id);

    if (!booking) {
        return (
            <div className="container mx-auto py-10 px-4 text-center">
                <h1 className="text-2xl font-bold text-slate-800">Booking Not Found</h1>
                <Link href="/my-bookings">
                    <Button className="mt-4 cursor-pointer" variant="outline">
                        Go Back
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <BookingDetailsView booking={booking} />
    );
}



