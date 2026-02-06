'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Bell, Search, User, Loader2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            const isAuthPath = pathname.startsWith('/auth');
            const isRootPath = pathname === '/';
            
            if (!currentUser && !isAuthPath && !isRootPath) {
                router.push('/auth/login');
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!user && (pathname.startsWith('/auth') || pathname === '/')) {
        return <>{children}</>;
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
                    <div className="relative w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder:text-white/30"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/60 hover:text-white group">
                            <Bell className="h-5 w-5" />
                            <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary border-2 border-[#050505] shadow-lg shadow-primary/50" />
                        </button>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/5">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black uppercase tracking-tight">{user.email?.split('@')[0] || 'Admin User'}</p>
                                <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mt-0.5">Super Admin</p>
                            </div>
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-black shadow-lg shadow-primary/20">
                                <User className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-10 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

