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
        <div className="p-8 max-w-5xl mx-auto w-full h-full">
            {/* <h1 className="text-2xl font-semibold text-[#271E4A] mb-8">Change Password</h1> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
            <div className="mt-12 flex justify-end gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-[100px] border-gray-300"
                >
                    Back
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-[100px] bg-[#4B39EF] hover:bg-[#3b2bce] text-white"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
            </div>
        </div>
    );
}
