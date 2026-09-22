"use client";

import Image from "next/image";
import { MerilLogo } from "@/components/meril-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isResetPage = pathname === "/reset";

    return (
        <div className={`min-h-screen w-full relative overflow-hidden ${isResetPage ? 'bg-slate-50 flex items-center justify-center' : 'grid grid-cols-1 lg:grid-cols-2 bg-[linear-gradient(117deg,#FAF1E4_30.77%,#DFECF3_87.02%)]'}`}>
            {/* Background Vectors only for non-reset pages */}
            {!isResetPage && (
                <>
                    {/* Background Vector - Top Left */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="794"
                        height="420"
                        viewBox="0 0 794 420"
                        fill="none"
                        className="hidden md:block absolute top-0 left-0 w-auto h-auto pointer-events-none z-0"
                    >
                        <path opacity="0.25" d="M767.448 19.915C755.953 28.7023 742.688 34.8904 728.569 38.0522L368.575 118.666L0 419.404V0H750H785.5H793.5L767.448 19.915Z" fill="url(#paint0_linear_4_7393)" />
                        <defs>
                            <linearGradient id="paint0_linear_4_7393" x1="263.677" y1="-84.7909" x2="404.677" y2="288.208" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#1C0F1F" />
                                <stop offset="1" stopColor="#1C0F1F" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Background Vector - Top Right */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="902"
                        height="587"
                        viewBox="0 0 902 587"
                        fill="none"
                        className="hidden md:block absolute top-0 right-0 w-auto h-auto pointer-events-none z-0"
                    >
                        <path opacity="0.25" d="M474.035 89.925L0 476.764L99.8003 552.903L902 587L875.559 0L474.035 89.925Z" fill="url(#paint0_linear_4_7392)" />
                        <defs>
                            <linearGradient id="paint0_linear_4_7392" x1="-0.000199818" y1="293.5" x2="902" y2="293.5" gradientUnits="userSpaceOnUse">
                                <stop stopColor="white" />
                                <stop offset="1" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Background Vector - Bottom Left */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="191"
                        height="254"
                        viewBox="0 0 191 254"
                        fill="none"
                        className="hidden md:block absolute bottom-0 left-0 w-auto h-auto pointer-events-none z-0"
                    >
                        <path opacity="0.5" d="M174.123 326.918L190.16 413.01L77.64 391.62L-67 45.26L135.11 0L157.09 184.462L174.123 326.918Z" fill="url(#paint0_linear_4_7394)" />
                        <defs>
                            <linearGradient id="paint0_linear_4_7394" x1="61.5804" y1="9.4167" x2="61.5804" y2="325.851" gradientUnits="userSpaceOnUse">
                                <stop stopColor="white" />
                                <stop offset="1" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Background Vector - Bottom Right */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="658"
                        height="168"
                        viewBox="0 0 658 168"
                        fill="none"
                        className="hidden md:block absolute bottom-0 right-[-4%] w-auto h-auto pointer-events-none z-0"
                    >
                        <path opacity="0.35" d="M202.164 5.24e-06L397.373 46.3809L-4.04968e-05 169.25L667.72 167.245L656.469 46.8456L202.164 5.24e-06Z" fill="url(#paint0_linear_4_7391)" />
                        <defs>
                            <linearGradient id="paint0_linear_4_7391" x1="332.466" y1="264.252" x2="336.528" y2="-15.5505" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#1C0F1F" />
                                <stop offset="1" stopColor="#1C0F1F" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                    
                    {/* Left Side - Illustration */}
                    <div className="hidden lg:flex relative flex-col items-center justify-center">
                        <div className="absolute top-8 left-8">
                            <Link href="/" className="flex items-center gap-2 z-50">
                                <MerilLogo className="w-[80px] h-[50px]" />
                            </Link>
                        </div>
                        <div className="relative w-full max-w-lg aspect-square">
                            <Image
                                src="/images/login-illustration.png"
                                alt="Meril Booking Illustration"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Right Side - Form (Centered if ResetPage) */}
            <div className={`flex items-center justify-center p-4 sm:p-8 lg:p-12 relative ${isResetPage ? 'w-full max-w-lg bg-white shadow-xl rounded-2xl mx-auto my-auto z-10' : 'w-full h-screen lg:h-auto'}`}>
                {/* Mobile/Standalone Logo */}
                {(!isResetPage) && (
                    <div className="absolute top-8 left-8 lg:hidden">
                        <MerilLogo className="w-[60px] h-[40px]" />
                    </div>
                )}
                {isResetPage && (
                    <div className="absolute top-6 left-6 hidden sm:block">
                        <MerilLogo className="w-[60px] h-[40px]" />
                    </div>
                )}

                <div className="w-full max-w-[420px] mx-auto relative z-10">
                    {isResetPage && (
                        <div className="mb-6 flex justify-center sm:hidden">
                            <MerilLogo className="w-[60px] h-[40px]" />
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
