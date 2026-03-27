import { api } from "@/services/api";
import { AdminLayoutContent } from "./admin-layout-content";
import { requireAuth } from "@/services/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 🔐 SSR Protection: validates session against Frappe backend
    // Allows access for any authenticated user, regardless of specific role
    await requireAuth();
    return (
        <AdminLayoutContent>{children}</AdminLayoutContent>
    );
}
