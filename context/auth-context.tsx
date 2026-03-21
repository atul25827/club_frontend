"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
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
            // 2. Refresh standard user data natively via JS to hydrate UI immediately
            const profile = await api.getLoggedUser();
            if (profile) {
                const fetchedRole = profile.role || "Academy User";
                const userData: User = {
                    id: profile.user_id,
                    name: profile.full_name || profile.user_id,
                    email: profile.email || profile.user_id,
                    role: fetchedRole,
                    employeeCode: profile.employee_code,
                    avatarUrl: profile.image,
                };
                setUser(userData);

                // 3. Command the Next.js server to fetch Frappe securely from the Edge
                // and mint a tamper-proof JWT `app_session` cookie.
                const syncRes = await fetch('/api/auth/sync', { method: 'POST' });
                if (!syncRes.ok) {
                    console.error("Failed to sync secure session with Next.js server");
                    // Continue anyway, but middleware won't let them in without `app_session`
                }
                return userData;
            } else {
                setUser(null);
                return null;
            }
        } catch (error) {
            console.error("Error during initAuth:", error);
            setUser(null);
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
        try {
            await api.logout();

            // Destroy the secure Next.js JWT Session
            await fetch('/api/auth/sync', { method: 'DELETE' });

            setUser(null);

            // 🔁 Broadcast logout to other tabs
            broadcast("LOGOUT");

            router.push("/login"); // Immediately redirect to wipe state
        } catch (error) {
            console.error("Error during logout:", error);
            // Even if logout fails on backend, try to clear local state
            setUser(null);
            broadcast("LOGOUT");
            router.push("/login");
        }
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
