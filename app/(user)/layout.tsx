import { AcademyProvider } from "@/context/academy-context";
import { api, Academy } from "@/services/api";
import { UserLayoutContent } from "./user-layout-content";

export default async function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // ⚠️ NO requireAuth() here — this group contains public pages (/, /about, /calendar)
    // Protected routes (/my-bookings, /book) have their own requireAuth() in their page files
    // Middleware handles fast redirects for unauthenticated users on protected routes

    // Fetch data on the server for fast initial load
    let academies: Academy[] = [];
    try {
        academies = await api.getAcademiesWithHalls();
    } catch (error) {
        console.error("Failed to fetch initial academy data", error);
    }

    return (
        <AcademyProvider initialData={academies}>
            <UserLayoutContent>{children}</UserLayoutContent>
        </AcademyProvider>
    );
}
