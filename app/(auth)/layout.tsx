import Image from "next/image";
import { MerilLogo } from "@/components/meril-logo";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[linear-gradient(to_right,#FAF1E4,#DFECF3)]">
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
                        alt="Meril Academy Illustration"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 lg:p-12 relative">
                {/* Mobile Logo */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <MerilLogo className="w-[60px] h-[40px]" />
                </div>

                <div className="w-full max-w-[420px] mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
