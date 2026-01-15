'use client';

import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Bell, Search, User } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/50 backdrop-blur-xl sticky top-0 z-50">
                    <div className="relative w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Universal Search..."
                            className="w-full h-11 bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/60 hover:text-white">
                            <Bell className="h-5 w-5" />
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary border-2 border-[#050505]" />
                        </button>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/5">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black uppercase tracking-tight">Admin User</p>
                                <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mt-0.5">Super Admin</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-black">
                                <User className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
vacation
