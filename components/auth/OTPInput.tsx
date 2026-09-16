import React, { useRef, KeyboardEvent } from "react";

interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
}

export function OTPInput({ value, onChange, length = 6, disabled = false }: OTPInputProps) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value;
        if (!/^[0-9]*$/.test(val)) return;

        const char = val.slice(-1); // Get the last typed character
        const newValueArray = value.split("");
        
        while (newValueArray.length < length) newValueArray.push("");
        newValueArray[index] = char;
        
        const newValue = newValueArray.join("");
        onChange(newValue.slice(0, length));

        if (char && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (!value[index] && index > 0) {
                inputsRef.current[index - 1]?.focus();
                const newValueArray = value.split("");
                newValueArray[index - 1] = "";
                onChange(newValueArray.join(""));
            } else {
                const newValueArray = value.split("");
                newValueArray[index] = "";
                onChange(newValueArray.join(""));
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
        if (!/^[0-9]*$/.test(pastedData)) return;
        onChange(pastedData);
        if (pastedData.length > 0) {
            inputsRef.current[Math.min(pastedData.length, length) - 1]?.focus();
        }
    };

    return (
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        inputsRef.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    disabled={disabled}
                    className="w-12 h-14 text-center text-xl font-medium rounded-[12px] border border-slate-200 bg-white shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
            ))}
        </div>
    );
}
