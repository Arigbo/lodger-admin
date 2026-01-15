'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    FileText,
    AlertCircle,
    Send,
    Settings,
    LogOut,
    Building2,
    ShieldCheck
} from 'lucide-react';

const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/' },
    { name: 'Users', icon: Users, href: '/users' },
    { name: 'Leases', icon: FileText, href: '/leases' },
    { name: 'Moderation', icon: AlertCircle, href: '/moderation' },
    { name: 'Broadcast', icon: Send, href: '/broadcast' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 h-screen flex flex-col bg-[#0a0a0a] border-r border-white/5 sticky top-0 overflow-y-auto">
            <div className="p-8">
                <div className="flex items-center gap-3 text-white mb-10">
                    <div className="bg-primary p-2 rounded-xl">
                        <ShieldCheck className="h-6 w-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase leading-none">
                            Lodger <span className="text-primary italic">Admin</span>
                        </h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Management Console</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group",
                                    isActive
                                        ? "bg-primary text-black"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5",
                                    isActive ? "text-black" : "text-white/40 group-hover:text-white"
                                )} />
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black/50" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-8 pt-0">
                <div className="h-px bg-white/5 mb-6" />
                <button className="flex items-center gap-4 px-4 py-4 text-white/40 hover:text-destructive transition-colors w-full group">
                    <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    <span className="font-bold text-sm tracking-tight uppercase">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
