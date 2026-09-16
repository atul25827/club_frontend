import React, { useMemo } from "react";

interface PasswordStrengthProps {
    password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
    const strength = useMemo(() => {
        let score = 0;
        if (!password) return score;

        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

        return score;
    }, [password]);

    const getStrengthColor = (score: number) => {
        if (score === 0) return "bg-gray-200";
        if (score <= 1) return "bg-red-500";
        if (score === 2) return "bg-orange-500";
        if (score === 3) return "bg-yellow-500";
        if (score >= 4) return "bg-green-500";
        return "bg-gray-200";
    };

    const getStrengthText = (score: number) => {
        if (score === 0) return "";
        if (score <= 1) return "Weak";
        if (score === 2) return "Fair";
        if (score === 3) return "Good";
        if (score >= 4) return "Strong";
        return "";
    };

    return (
        <div className="space-y-1">
            <div className="flex gap-1 h-1.5 mt-2">
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                            strength >= level ? getStrengthColor(strength) : "bg-slate-200"
                        }`}
                    />
                ))}
            </div>
            {strength > 0 && (
                <p className={`text-xs ${strength >= 4 ? "text-green-600" : "text-slate-500"}`}>
                    Password strength: {getStrengthText(strength)}
                </p>
            )}
        </div>
    );
}
