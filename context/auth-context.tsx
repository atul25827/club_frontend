"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Types
import { api } from "@/lib/api";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load auth state from localStorage on mount
    // Load auth state from localStorage or Cookie on mount
    // Load auth state from Cookie ONLY (Ideal Source of Truth for Next.js)
    // Load auth state from Backend Session (Source of Truth)
    useEffect(() => {
        async function initAuth() {
            try {
                // Fetch user profile from backend (uses sid cookie)
                const userData = await api.getLoggedUser();

                if (userData) {
                    // Map API response to User type
                    const apiUser: User = {
                        id: userData.user_id,
                        name: userData.full_name || userData.user_id,
                        email: userData.email || userData.user_id,
                        role: userData.role || "Academy User",
                        employeeCode: userData.employee_code,
                        avatarUrl: userData.image
                    };
                    setUser(apiUser);
                } else {
                    setUser(null);
                    // Optional: Clear middleware cookie if backend session is invalid
                    // document.cookie = "auth_token=; path=/; max-age=0"; 
                }
            } catch (error) {
                console.error("Auth initialization failed:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const result = await api.login(email, password);

            if (result.error) {
                throw new Error(result.error);
            }

            // Login successful on backend (sid cookie set)
            // Now fetch the true profile from backend
            const userData = await api.getLoggedUser();

            if (!userData) {
                throw new Error("Failed to fetch user profile after login");
            }

            const apiUser: User = {
                id: userData.user_id,
                name: userData.full_name || userData.user_id,
                email: userData.email || userData.user_id,
                role: userData.role || "Academy User",
                employeeCode: userData.employee_code,
                avatarUrl: userData.image
            };

            setUser(apiUser);

            // We continue to set auth_token cookie JUST for Middleware redirection (not for data trust)
            document.cookie = `auth_token=${encodeURIComponent(JSON.stringify(apiUser))}; path=/; max-age=${60 * 60 * 24 * 7}`;

            if (apiUser.role?.toUpperCase() === "ACADEMY ADMIN") {
                router.push("/dashboard");
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "sid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "system_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "full_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

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
