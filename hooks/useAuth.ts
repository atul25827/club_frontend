import { useState, useCallback } from "react";
import { api } from "@/services/api";

export function useAuth() {
    const [loading, setLoading] = useState(false);

    // const register = useCallback(async (data: any) => {
    //     setLoading(true);
    //     try {
    //         const response = await api.registerUser(data);
    //         if (response.error) throw new Error(response.error);
    //         return response.data;
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);

    // const sendSignupOtp = useCallback(async (email: string, employee_code: string) => {
    //     try {
    //         const response = await api.sendSignupOtp(email, employee_code);
    //         if (response.error) throw new Error(response.error);
    //         return response.data;
    //     } catch (error) {
    //         throw error;
    //     }
    // }, []);

    // const verifySignupOtp = useCallback(async (email: string, otp: string, employee_code: string) => {
    //     try {
    //         const response = await api.verifySignupOtp(email, otp, employee_code);
    //         if (response.error) throw new Error(response.error);
    //         return response.data;
    //     } catch (error) {
    //         throw error;
    //     }
    // }, []);

    const forgotPassword = useCallback(async (email: string, app_name: string = "club") => {
        setLoading(true);
        try {
            const response = await api.forgotPassword(email, app_name);
            if (response.error) throw new Error(response.error);
            return response.data;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        // register,
        // sendSignupOtp,
        // verifySignupOtp,
        forgotPassword,
        loading,
    };
}
