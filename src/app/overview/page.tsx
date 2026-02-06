'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    FileText,
    AlertTriangle,
    TrendingUp,
    Loader2
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Stats {
    totalUsers: number;
    activeProperties: number;
    leaseAgreements: number;
    pendingReports: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        activeProperties: 0,
        leaseAgreements: 0,
        pendingReports: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch all collections in parallel
                const [usersSnap, propertiesSnap, leasesSnap, reportsSnap] = await Promise.all([
                    getDocs(collection(db, 'users')),
                    getDocs(query(collection(db, 'properties'), where('status', '==', 'available'))),
                    getDocs(collection(db, 'leaseAgreements')),
                    getDocs(query(collection(db, 'userReports'), where('status', '==', 'pending')))
                ]);

                setStats({
                    totalUsers: usersSnap.size,
                    activeProperties: propertiesSnap.size,
                    leaseAgreements: leasesSnap.size,
                    pendingReports: reportsSnap.size
                });
            } catch (err: any) {
                console.error("Error fetching dashboard stats:", err);
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const statsConfig = [
        { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
        { name: 'Active Properties', value: stats.activeProperties, icon: Building2, color: 'text-emerald-400' },
        { name: 'Lease Agreements', value: stats.leaseAgreements, icon: FileText, color: 'text-amber-400' },
        { name: 'Pending Reports', value: stats.pendingReports, icon: AlertTriangle, color: 'text-rose-400' },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-headline font-black uppercase tracking-tighter">
                        Dashboard <span className="text-primary italic">Overview</span>
                    </h2>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">Real-time analytics & system status</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/60">System Online</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            ) : error ? (
                <div className="p-10 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-center">
                    <p className="text-rose-500 font-bold">Error loading dashboard: {error}</p>
                    <p className="text-xs text-white/40 mt-2">Check console for details</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsConfig.map((stat) => (
                            <div key={stat.name} className="relative group overflow-hidden p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all hover:scale-[1.02]">
                                <div className="absolute top-0 right-0 p-8">
                                    <stat.icon className={`h-10 w-10 ${stat.color} opacity-20 group-hover:scale-110 transition-transform`} />
                                </div>

                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{stat.name}</p>
                                    <h3 className="text-4xl font-black tracking-tight mb-4">{stat.value.toLocaleString()}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Live Data</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 mx-auto mb-6">
                            <TrendingUp className="h-10 w-10 text-primary" />
                        </div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter">Platform <span className="text-primary italic">Insights</span></h4>
                        <p className="text-sm text-white/40 font-medium px-4 mt-2 max-w-2xl mx-auto">
                            All metrics are pulled directly from your Firestore database in real-time.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
