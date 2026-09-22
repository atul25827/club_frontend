"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ChangePasswordPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [logoutAllSessions, setLogoutAllSessions] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Formatting role display
    const displayRole = Array.isArray(user?.role)
        ? user?.role.join(", ")
        : user?.role || "User";

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!currentPassword) {
            newErrors.currentPassword = "Current password is required";
        }
        if (!newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(newPassword)) {
            newErrors.newPassword = "Password must contain at least one uppercase letter";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const payload = {
                user: user?.email || user?.id,
                current_password: currentPassword,
                new_password: newPassword,
                logout_all_sessions: logoutAllSessions ? 1 : 0
            };

            const response = await api.changePassword(payload);

            if (response.error) {
                toast.error(response.error);
                setErrors({ submit: response.error });
            } else {
                const resMessage = response.data?.message;
                const successText = typeof resMessage === 'object' && resMessage !== null
                    ? resMessage.message
                    : (resMessage || "Password updated successfully.");

                toast.success(successText);

                if (logoutAllSessions) {
                    await logout();
                } else {
                    router.push("/dashboard"); // Or wherever back goes
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full h-full max-sm:bg-white max-sm:rounded-t-[24px] max-sm:shadow-lg max-sm:relative max-sm:-mt-4">
            <div className="mx-auto w-12 h-1 bg-gray-200 rounded-full sm:hidden absolute top-3 left-1/2 -translate-x-1/2" />
            {/* <div className="sm:hidden mt-6 mb-4">
                <h2 className="text-xl font-bold text-[#0F172A]">Changes Password</h2>
                <p className="text-sm text-[#94A3B8]">Contact the club admin team for assistance.</p>
                <div className="w-full h-px bg-[#E2E8F0] my-4" />
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-6">
                {/* Row 1 */}
                <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                    <Input
                        id="username"
                        value={user?.email || user?.id || ""}
                        readOnly
                        disabled
                        className="bg-gray-50 border-gray-200"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input
                        id="fullName"
                        value={user?.name || ""}
                        readOnly
                        disabled
                        className="bg-gray-50 border-gray-200"
                    />
                </div>

                {/* Row 2 */}
                {/* <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                    <Input
                        id="role"
                        value={displayRole}
                        readOnly
                        disabled
                        className="bg-gray-50 border-gray-200"
                    />
                </div> */}
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password <span className="text-red-500">*</span></Label>
                    <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            if (errors.currentPassword) setErrors({ ...errors, currentPassword: "" });
                        }}
                        className={errors.currentPassword ? "border-red-500" : "bg-blue-50/50"}
                        placeholder="••••••••"
                    />
                    {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>}
                </div>

                {/* Row 3 */}
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password <span className="text-red-500">*</span></Label>
                    <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (errors.newPassword) setErrors({ ...errors, newPassword: "" });
                        }}
                        className={errors.newPassword ? "border-red-500" : ""}
                    />
                    {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                        }}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
                <div className="mt-8 flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="logoutAllSessions"
                        checked={logoutAllSessions}
                        onChange={(e) => setLogoutAllSessions(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                    />
                    <Label htmlFor="logoutAllSessions" className="text-sm font-medium text-gray-700 cursor-pointer">
                        logout from all session
                    </Label>
                </div>
            </div>


            {/* Buttons */}
            <div className="mt-8 sm:mt-12 flex justify-end gap-4 max-sm:flex-row">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 sm:w-[100px] border-gray-300 h-12 rounded-xl"
                >
                    Back
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 sm:w-[100px] bg-[#111827] hover:bg-black text-white h-12 rounded-xl"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
            </div>
        </div>
    );
}
