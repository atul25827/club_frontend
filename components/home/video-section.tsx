"use client";

import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { useRef, useState } from "react";

export function VideoSection() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <section className="py-10 md:py-16 relative overflow-hidden">
            <div className="container px-4 md:px-6 max-w-7xl mx-auto">
                <div className="flex flex-col gap-8 lg:gap-12">
                    {/* Text Highlight Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mx-auto"
                    >
                        <p className="capitalize sm:text-[24px] md:text-[32px] md:leading-[56px] font-poppins text-[#33398a] font-normal">
                            Meril Academy is a global platform for lifelong learning, offering <span className="text-[#fdc814]">knowledge-sharing programs</span> and <span className="text-[#fdc814]">fellowship</span> opportunities to support the advancement of medical therapies and the healthcare community.
                        </p>
                    </motion.div>

                    {/* Video Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100 group"
                    >
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            poster="https://images.unsplash.com/photo-1544928147-79a2e746b5bd?q=80&w=2070&auto=format&fit=crop"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        >
                            <source src="https://assets.mixkit.co/videos/preview/mixkit-group-of-people-walking-in-a-hallway-4835-large.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                        {/* Overlay & Controls */}
                        <div
                            className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                            onClick={togglePlay}
                        >
                            <button
                                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/50 flex items-center justify-center text-white transition-transform duration-300 hover:scale-110 hover:bg-white/30"
                                aria-label={isPlaying ? "Pause video" : "Play video"}
                            >
                                {isPlaying ? (
                                    <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                                ) : (
                                    <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
