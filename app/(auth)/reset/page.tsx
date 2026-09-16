"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useResetPassword } from "@/hooks/useResetPassword";
import { FormField } from "@/components/auth/FormField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { validateResetPassword } from "@/lib/validators";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const { verifyToken, resetPassword, loading, isValidating, isValid } = useResetPassword();

    const [formData, setFormData] = useState({
        new_password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (token) {
            verifyToken(token);
        }
    }, [token, verifyToken]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors((prev) => ({ ...prev, [id]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateResetPassword(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await resetPassword({ token, new_password: formData.new_password });
            toast.success("Password reset successfully");
            router.push("/login");
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password. Please try again.");
        }
    };

    if (!token) {
        return (
            <div className="text-center space-y-6">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h1 className="text-2xl font-normal text-slate-800">Invalid link</h1>
                <p className="text-slate-500">The password reset link is missing or malformed.</p>
                <Button onClick={() => router.push("/forgot-password")} className="w-full">
                    Request new link
                </Button>
            </div>
        );
    }

    if (isValidating) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-slate-500">Validating reset link...</p>
            </div>
        );
    }

    if (!isValid) {
        return (
            <div className="text-center space-y-6">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h1 className="text-2xl font-normal text-slate-800">Link expired or invalid</h1>
                <p className="text-slate-500">This password reset link has expired or is no longer valid.</p>
                <Button onClick={() => router.push("/forgot-password")} className="w-full h-12 bg-[#7D3FD0] hover:bg-[#6c35b5] text-white">
                    Request new link
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-normal text-slate-800 tracking-tight">Set new password</h1>
                <p className="text-slate-500 text-sm">
                    Please secure your account with a strong password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <FormField
                            id="new_password"
                            type="password"
                            label="New Password"
                            placeholder="Enter new password"
                            value={formData.new_password}
                            onChange={handleChange}
                            error={errors.new_password}
                        />
                        <div className="mt-1">
                            <PasswordStrength password={formData.new_password} />
                        </div>
                    </div>

                    <FormField
                        id="confirm_password"
                        type="password"
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        error={errors.confirm_password}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full cursor-pointer h-12 bg-[#7D3FD0] hover:bg-[#6c35b5] text-white text-lg font-normal rounded-[12px] shadow-lg shadow-purple-900/10 transition-all hover:shadow-purple-900/20"
                    disabled={loading}
                >
                    {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Reset password
                </Button>

                <div className="flex justify-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm text-slate-500 hover:text-purple-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-slate-500">Loading...</p>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
