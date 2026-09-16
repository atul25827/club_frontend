import { useState, useCallback } from "react";
import { api } from "@/services/api";

export function useResetPassword() {
    const [loading, setLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);

    const verifyToken = useCallback(async (token: string) => {
        setIsValidating(true);
        try {
            const response = await api.verifyResetToken(token);
            if (response.error) {
                setIsValid(false);
            } else {
                setIsValid(true);
            }
        } catch {
            setIsValid(false);
        } finally {
            setIsValidating(false);
        }
    }, []);

    const resetPassword = useCallback(async (data: any) => {
        setLoading(true);
        try {
            const response = await api.resetPassword(data);
            if (response.error) throw new Error(response.error);
            return response.data;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        verifyToken,
        resetPassword,
        loading,
        isValidating,
        isValid,
    };
}
