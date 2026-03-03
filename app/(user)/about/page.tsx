import { BookOpen, GraduationCap, Heart, Laptop, MonitorPlay, Stethoscope, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AboutPage() {
    return (
        <div className="container mx-auto py-12 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Hero Section */}
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-2">
                    <GraduationCap className="w-3 h-3 mr-2" />
                    Meril Academy
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                    Inspiring Excellence in Healthcare
                </h1>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    Through the Meril Academy, we are committed to engage, inspire excellence and continuous learning & development amongst healthcare professionals.
                </p>
            </div>

            {/* Focus Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Stethoscope className="w-32 h-32 text-blue-600" />
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Advanced Medical Technology</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        Our focus is to enable doctors and surgeons to adapt to advanced medical technology innovations. We provide comprehensive curriculum within every one of our customisable programs.
                    </p>
                </div>

                <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Laptop className="w-32 h-32 text-purple-600" />
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                        <Laptop className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">E-Learning Programs</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        E-learning forms a substantial part of the Academy training modules to connect medical professionals with experienced faculty to enhance their skills through interactive sessions.
                    </p>
                </div>
            </div>

            {/* Training & Videos */}
            <div className="mb-20">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">What We Offer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            title: "Training Programs",
                            desc: "Comprehensive, customisable curriculum for healthcare professionals.",
                            icon: BookOpen,
                            color: "text-amber-600",
                            bg: "bg-amber-100"
                        },
                        {
                            title: "Demonstration Videos",
                            desc: "Training and demonstration videos for day-to-day patient care improvement.",
                            icon: MonitorPlay,
                            color: "text-emerald-600",
                            bg: "bg-emerald-100"
                        },
                        {
                            title: "Expert Faculty",
                            desc: "Connect with experienced faculty to enhance your medical skills.",
                            icon: Users,
                            color: "text-blue-600",
                            bg: "bg-blue-100"
                        },
                        {
                            title: "Interactive Sessions",
                            desc: "Engage in interactive learning sessions to stay ahead in medical innovation.",
                            icon: Video,
                            color: "text-purple-600",
                            bg: "bg-purple-100"
                        }
                    ].map((val, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", val.bg, val.color)}>
                                <val.icon className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-2">{val.title}</h4>
                            <p className="text-sm text-slate-500">{val.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Highlight Banner */}
            <div className="bg-slate-900 rounded-[32px] p-8 md:p-12 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-800 to-slate-900 z-0"></div>
                <div className="relative z-10 max-w-3xl mx-auto space-y-4">
                    <Heart className="w-10 h-10 mx-auto text-rose-400 mb-2" />
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white/90">
                        Committed to Better Patient Care
                    </h3>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Training and demonstration videos are made available to healthcare professionals who would like to improve on their day-to-day patient care.
                    </p>
                </div>
            </div>

        </div>
    );
}
