import { apiServer } from "@/services/api-server";
import { CreateBookingWrapper } from "./create-booking-wrapper";

export default async function AdminCreateBookingPage() {
    const masterData = await apiServer.getClubMasterData();
    return (
        <div className="bg-white rounded-[24px] animate-in fade-in duration-500">
            <div className="hidden" id="debug-master-data">{JSON.stringify(masterData)}</div>
            <CreateBookingWrapper masterData={masterData} />
        </div>
    );
}
