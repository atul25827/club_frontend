"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Restrict Developer Tools
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12' || e.keyCode === 123) {
                e.preventDefault();
            }
            // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault();
            }
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Logged in successfully");
        } catch (error: any) {
            toast.error(error.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-normal text-slate-800 tracking-tight">Sign in</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-normal text-slate-500 ml-1">
                            Enter your Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white border-0 h-12 px-4 shadow-sm rounded-xl text-base text-slate-900 placeholder:text-[#A9A9A9] ring-offset-transparent focus-visible:ring-2 focus-visible:ring-purple-600/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-normal text-slate-500 ml-1">
                            Your password
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required // Adding required roughly, though functionality is mocked
                                className="bg-white border-0 h-12 px-4 pr-10 shadow-sm rounded-xl text-base text-slate-900 placeholder:text-[#A9A9A9] ring-offset-transparent focus-visible:ring-2 focus-visible:ring-purple-600/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                                <span className="sr-only">Toggle password visibility</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-slate-500 underline decoration-slate-400/50 hover:text-purple-700 hover:decoration-purple-700 transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full cursor-pointer h-12 bg-[#7D3FD0] hover:bg-[#6c35b5] text-white text-lg font-normal rounded-[12px] shadow-lg shadow-purple-900/10 transition-all hover:shadow-purple-900/20"
                    disabled={loading}
                >
                    {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Log in
                </Button>
            </form>
        </div>
    );
}
