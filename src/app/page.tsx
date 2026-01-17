'use client';

import React from 'react';
import {
    Users,
    Building2,
    FileText,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp
} from 'lucide-react';

const stats = [
    { name: 'Total Users', value: '1,284', change: '+12.5%', trend: 'up', icon: Users, color: 'text-blue-400' },
    { name: 'Active Properties', value: '432', change: '+5.2%', trend: 'up', icon: Building2, color: 'text-emerald-400' },
    { name: 'Lease Agreements', value: '156', change: '-2.4%', trend: 'down', icon: FileText, color: 'text-amber-400' },
    { name: 'Pending Reports', value: '12', change: '+3 new', trend: 'neutral', icon: AlertTriangle, color: 'text-rose-400' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter">
                        Dashboard <span className="text-primary italic">Overview</span>
                    </h2>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">Analytical insights & system status</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/60">System Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="relative group overflow-hidden p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-8">
                            <stat.icon className={`h-10 w-10 ${stat.color} opacity-20 group-hover:scale-110 transition-transform`} />
                        </div>

                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{stat.name}</p>
                            <h3 className="text-4xl font-black tracking-tight mb-4">{stat.value}</h3>

                            <div className="flex items-center gap-2">
                                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' :
                                    stat.trend === 'down' ? 'bg-rose-500/10 text-rose-500' :
                                        'bg-white/10 text-white/60'
                                    }`}>
                                    {stat.change}
                                </div>
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Since last month</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-white/5 border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">System <span className="text-primary italic">Activity</span></h3>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Growth progression over time</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-3 px-4">
                        {[40, 70, 45, 90, 65, 80, 55, 100, 85, 95, 75, 110].map((h, i) => (
                            <div key={i} className="flex-1 relative group/bar">
                                <div
                                    className="w-full bg-white/10 rounded-t-lg group-hover/bar:bg-primary transition-all duration-500 ease-out"
                                    style={{ height: `${h}%` }}
                                />
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/20 uppercase tracking-tighter opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                    M{i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <TrendingUp className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter">Projected <span className="text-primary italic">Growth</span></h4>
                        <p className="text-sm text-white/40 font-medium px-4 mt-2">
                            Based on current metrics, we expect a 15% increase in user retention by Q3.
                        </p>
                    </div>
                    <button className="px-8 py-3 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                        Detailed PDF Report
                    </button>
                </div>
            </div>
        </div>
    );
}
