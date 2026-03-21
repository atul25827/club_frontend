"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/api/api";
import { User, UserRole } from "@/types";

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔁 Broadcast helper for multi-tab sync
function broadcast(type: "LOGIN" | "LOGOUT") {
    try {
        const channel = new BroadcastChannel("auth");
        channel.postMessage({ type });
        channel.close();
    } catch {
        // BroadcastChannel not supported in some environments (e.g., SSR)
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // 🔥 INIT: Source of truth = Frappe backend via api.getLoggedUser()
    useEffect(() => {
        initAuth();
    }, []);

    // 📡 Multi-tab sync: listen for LOGIN/LOGOUT from other tabs
    useEffect(() => {
        let channel: BroadcastChannel;
        try {
            channel = new BroadcastChannel("auth");
        } catch {
            // BroadcastChannel not supported
            return;
        }

        channel.onmessage = async (event) => {
            if (event.data?.type === "LOGIN") {
                // Re-fetch user data so nav/UI updates (e.g., "My Bookings" appears)
                await initAuth();
                router.refresh(); // Also refresh server components
            }

            if (event.data?.type === "LOGOUT") {
                setUser(null);
                document.cookie = "role=; Max-Age=0; path=/";
                router.push("/login");
            }
        };

        return () => channel.close();
    }, [router]);

    async function initAuth() {
        try {
            const userData = await api.getLoggedUser();

            if (userData) {
                const apiUser: User = {
                    id: userData.user_id,
                    name: userData.full_name || userData.user_id,
                    email: userData.email || userData.user_id,
                    role: userData.role || "Academy User",
                    employeeCode: userData.employee_code,
                    avatarUrl: userData.image,
                };
                setUser(apiUser);

                // ✅ Set role cookie (UPPERCASE) for middleware fast routing
                const role = (apiUser.role || "").toUpperCase();
                document.cookie = `role=${role}; path=/; max-age=${60 * 60 * 24 * 7}`;

                return apiUser;
            } else {
                setUser(null);
                document.cookie = "role=; Max-Age=0; path=/";
                return null;
            }
        } catch {
            setUser(null);
            document.cookie = "role=; Max-Age=0; path=/";
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    // 🔐 LOGIN
    const login = async (email: string, password: string) => {
        const result = await api.login(email, password);

        if (result.error) {
            throw new Error(result.error);
        }

        // ✅ Hydrate session from Frappe (also sets role cookie)
        const loggedUser = await initAuth();

        // 🔁 Broadcast login to other tabs
        broadcast("LOGIN");

        // Redirect based on role
        const role = (loggedUser?.role || "").toUpperCase();

        if (role === "ACADEMY ADMIN") {
            router.push("/dashboard");
        } else {
            router.push("/");
        }
    };

    // 🔐 LOGOUT
    const logout = async () => {
        await api.logout();

        setUser(null);

        // Clear server-set role cookie
        document.cookie = "role=; Max-Age=0; path=/";

        // 🔁 Broadcast logout to other tabs
        broadcast("LOGOUT");

        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role: user?.role || null,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
