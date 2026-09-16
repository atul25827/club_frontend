"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FormField } from "@/components/auth/FormField";
import { validateEmail } from "@/lib/validators";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { forgotPassword, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }

        try {
            await forgotPassword(email);
            // Always show success message to prevent user enumeration
            setIsSubmitted(true);
        } catch (error: any) {
            // Even on error, we might want to just show the success message depending on security policy
            // But we can use a generic toast for unhandled exceptions
            toast.error(error.message || "Something went wrong. Please try again.");
        }
    };

    if (isSubmitted) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 className="text-3xl font-normal text-slate-800 tracking-tight">Check your email</h1>
                <p className="text-slate-500 max-w-sm mx-auto">
                    If an account exists for that email, we have sent password reset instructions.
                </p>
                <div className="pt-4">
                    <Button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="w-full h-12 bg-[#7D3FD0] hover:bg-[#6c35b5] text-white text-lg font-normal rounded-[12px] shadow-lg shadow-purple-900/10 transition-all hover:shadow-purple-900/20"
                    >
                        Return to login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-normal text-slate-800 tracking-tight">Reset password</h1>
                <p className="text-slate-500 text-sm">
                    Enter your email to receive a password reset link.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <FormField
                    id="email"
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                    }}
                    error={error}
                />

                <Button
                    type="submit"
                    className="cursor-pointer w-full h-12 bg-[#7D3FD0] hover:bg-[#6c35b5] text-white text-lg font-normal rounded-[12px] shadow-lg shadow-purple-900/10 transition-all hover:shadow-purple-900/20"
                    disabled={loading || !email}
                >
                    {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Send reset link
                </Button>

                <div className="flex justify-center">
                    <Link
                        href="/login"
                        className="cursor-pointer inline-flex items-center text-sm text-slate-500 hover:text-purple-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                    </Link>
                </div>
            </form>
        </div>
    );
}
