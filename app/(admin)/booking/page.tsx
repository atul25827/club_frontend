import { apiServer } from "@/api/api-server";
import { CreateBookingWrapper } from "./create-booking-wrapper";

export default async function AdminCreateBookingPage() {
    const masterData = await apiServer.getMasterData();
    const academies = await apiServer.getAcademiesWithHalls();//need to removed

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-[0px_4px_15px_0px_rgba(216,210,252,0.64)] animate-in fade-in duration-500">
            <h2 className="text-[24px] font-medium text-[#271E4A] font-poppins mb-6">Create New Booking</h2>
            <CreateBookingWrapper masterData={masterData} academies={academies} />
        </div>
    );
}
