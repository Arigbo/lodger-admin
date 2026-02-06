'use client';

import React from 'react';
import { ShieldCheck, ChevronRight, Lock, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            
            <div className="relative z-10 w-full max-w-2xl text-center space-y-12">
                <div className="space-y-4">
                    <div className="mx-auto h-20 w-20 rounded-[2.5rem] bg-primary flex items-center justify-center text-black mb-8 shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.5)]">
                        <ShieldCheck className="h-10 w-10" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                        Lodger <span className="text-primary italic">Admin</span>
                    </h1>
                    <p className="text-sm md:text-base font-bold text-white/40 uppercase tracking-[0.3em]">Institutional Control Surface</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                    <Link href="/auth/login" className="group relative p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 text-left overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110">
                            <Lock className="h-20 w-20 text-primary" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-500">
                                <Lock className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Personnel Login</h3>
                                <p className="text-xs font-medium text-white/40 mt-1 uppercase tracking-widest">Authorized Access Only</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                Start Session <ChevronRight className="h-3 w-3" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/auth/signup" className="group relative p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 text-left overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110">
                            <UserPlus className="h-20 w-20 text-primary" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-500">
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Recruitment</h3>
                                <p className="text-xs font-medium text-white/40 mt-1 uppercase tracking-widest">Request New Clearance</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                Enroll System <ChevronRight className="h-3 w-3" />
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="pt-12">
                    <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                        System Version 1.0.4-Stable
                    </div>
                </div>
            </div>
        </div>
    );
}
