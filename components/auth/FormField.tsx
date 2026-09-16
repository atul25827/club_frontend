import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    rightIcon?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, error, className, type, rightIcon, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === "password";
        const inputType = isPassword ? (showPassword ? "text" : "password") : type;

        return (
            <div className={`space-y-2 ${className || ""}`}>
                <label htmlFor={props.id} className="text-sm font-normal text-slate-500 ml-1">
                    {label}
                </label>
                <div className="relative">
                    <Input
                        ref={ref}
                        type={inputType}
                        {...props}
                        className={`bg-white border-0 h-12 px-4 shadow-sm rounded-xl text-base text-slate-900 placeholder:text-[#A9A9A9] ring-offset-transparent focus-visible:ring-2 focus-visible:ring-purple-600/20 ${
                            isPassword || rightIcon ? "pr-10" : ""
                        } ${error ? "ring-2 ring-red-500/50 focus-visible:ring-red-500/50" : ""}`}
                    />
                    {isPassword && (
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
                    )}
                    {rightIcon && !isPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
            </div>
        );
    }
);

FormField.displayName = "FormField";
