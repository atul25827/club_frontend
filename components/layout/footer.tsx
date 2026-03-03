"use client";

import Link from "next/link";
import { Facebook, Youtube, Instagram, Linkedin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="w-full bg-slate-50 border-t border-slate-200 mt-auto">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl py-4 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-linear-to-br from-[#7D3FD0] to-[#33398A] rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/10">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-poppins font-bold text-xl leading-none text-[#33398A]">Meril</span>
                                <span className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">Academy</span>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed max-w-xs">
                            Discover inspiring venues and curated details that make meetings memorable—plan your next event at our Meril.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { icon: Facebook, href: "https://www.facebook.com/MerilLifeSciences/" },
                                { icon: Youtube, href: "https://www.youtube.com/channel/UCpPK08HhfAMqjKlTVSFJN1A" },
                                { icon: Instagram, href: "https://www.instagram.com/merilglobal/" },
                                { icon: Linkedin, href: "https://www.linkedin.com/company/meril-life-sciences-india-pvt-ltd/" },
                            ].map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-[#7D3FD0] hover:border-[#7D3FD0] hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm text-slate-600"
                                >
                                    <item.icon className="w-4 h-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2">
                        <h4 className="font-semibold text-[#33398A] mb-6">Company</h4>
                        <div className="flex flex-col gap-3 text-sm text-slate-600">
                            <Link href="/about" className="hover:text-[#7D3FD0] transition-colors">About Us</Link>
                            {/* <Link href="#" className="hover:text-[#7D3FD0] transition-colors">Careers</Link>
                            <Link href="#" className="hover:text-[#7D3FD0] transition-colors">News & Media</Link> */}
                            <Link href="#" className="hover:text-[#7D3FD0] transition-colors">Contact Us</Link>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="font-semibold text-[#33398A] mb-6">Legal</h4>
                        <div className="flex flex-col gap-3 text-sm text-slate-600">
                            <Link href="#" className="hover:text-[#7D3FD0] transition-colors">Privacy Policy</Link>
                            <Link href="#" className="hover:text-[#7D3FD0] transition-colors">Terms & Conditions</Link>
                            <Link href="#" className="hover:text-[#7D3FD0] transition-colors">Cookie Policy</Link>
                        </div>
                    </div>

                    {/* Newsletter Column */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                            <h4 className="font-bold text-lg text-[#33398A] mb-2">Be informed!</h4>
                            <p className="text-sm text-slate-600 mb-4">
                                Get the latest wellness tips, product launches
                                & exclusive offers straight to your inbox.
                            </p>
                            <div className="space-y-3">
                                <div className="relative">
                                    <Input
                                        placeholder="Enter your email"
                                        className="pl-4 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                    />
                                    <Send className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                                <Button className="w-full h-11 bg-[#7D3FD0] hover:bg-[#6a32b5] text-white rounded-xl shadow-lg shadow-purple-500/20">
                                    Subscribe Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Meril Academy. All rights reserved.</p>
                    <p>Designed for Excellence</p>
                </div>
            </div>
        </footer>
    );
}

// "use client";

// import Link from "next/link";
// import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// export function Footer() {
//     return (
//         <footer className="w-full bg-slate-50 border-t border-slate-200 mt-auto h-20">
//             <p>hello footer</p>
//         </footer>
//     );
// }
