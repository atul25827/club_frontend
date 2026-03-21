import { api, Academy } from "@/api/api";
import { AcademyProvider } from "@/context/academy-context";
import { AdminLayoutContent } from "./admin-layout-content";
import { requireAuth } from "@/api/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 🔐 SSR Protection: validates session against Frappe backend
    // Redirects to "/" if user doesn't have "ACADEMY ADMIN" role
    await requireAuth("ACADEMY ADMIN");

    let academies: Academy[] = [];
    try {
        academies = await api.getAcademiesWithHalls();
    } catch (error) {
        console.error("Failed to fetch academies for admin layout", error);
    }

    return (
        <AcademyProvider initialData={academies}>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AcademyProvider>
    );
}
