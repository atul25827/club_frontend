"use client";

import { useAuth } from "@/context/auth-context";
import { DASHBOARD_REGISTRY } from "./config";
import { DynamicDashboardSection } from "./dynamic-dashboard-section";
import { useMemo } from "react";
import { Tabs } from "@/components/ui/tabs";

export default function AdminDashboardPage() {
    const { role, isLoading, isAuthenticated } = useAuth();

    const activeDashboards = useMemo(() => {
        if (!role) return [];

        const userRoles = Array.isArray(role) ? role : [role];
        const normalizedUserRoles = userRoles.map(r => r.toUpperCase());

        // Find all dashboards in registry that match any of the user's roles
        return DASHBOARD_REGISTRY.filter(dash =>
            dash.roles.some(requiredRole =>
                normalizedUserRoles.includes(requiredRole.toUpperCase())
            )
        );
    }, [role]);

    if (isLoading || !isAuthenticated) {
        return null; // Prevents generic fallback UI from flashing during logout or initial load
    }

    if (activeDashboards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <h2 className="text-2xl font-semibold text-slate-700">No dashboard assigned</h2>
                <p className="text-slate-500 text-center max-w-md">
                    You don't have the necessary roles to view any specific dashboards.
                    Please contact your administrator if you believe this is an error.
                </p>
                <div className="text-xs text-slate-400 bg-slate-100 p-2 rounded">
                    Current Roles: {Array.isArray(role) ? role.join(", ") : (role || "None")}
                </div>
            </div>
        );
    }

    if (activeDashboards.length === 1) {
        return <DynamicDashboardSection definition={activeDashboards[0]} />;
    }

    const tabs = activeDashboards.map((dash) => ({
        id: dash.id,
        label: dash.title,
        content: <DynamicDashboardSection definition={dash} />
    }));

    return (
        <div className="animate-in fade-in duration-500">
            <Tabs tabs={tabs} />
        </div>
    );
}