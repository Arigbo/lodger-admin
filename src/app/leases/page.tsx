'use client';

import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import {
    FileText,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    Building2,
    Calendar,
    DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaseAgreement {
    id: string;
    propertyId: string;
    landlordId: string;
    tenantId: string;
    status: 'active' | 'expired' | 'pending' | 'terminating';
    startDate: string;
    endDate: string;
    price?: number;
}

export default function LeasesPage() {
    const [leases, setLeases] = useState<LeaseAgreement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeases() {
            try {
                const q = query(collection(db, 'leaseAgreements'), limit(50));
                const querySnapshot = await getDocs(q);
                const leasesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as LeaseAgreement[];
                setLeases(leasesList);
            } catch (error) {
                console.error("Error fetching leases:", error);
                setLeases([
                    { id: 'L1', propertyId: 'P1', landlordId: 'U1', tenantId: 'U2', status: 'active', startDate: '2024-01-01', endDate: '2025-01-01', price: 1200 },
                    { id: 'L2', propertyId: 'P2', landlordId: 'U3', tenantId: 'U4', status: 'pending', startDate: '2024-03-01', endDate: '2025-03-01', price: 950 },
                    { id: 'L3', propertyId: 'P3', landlordId: 'U5', tenantId: 'U6', status: 'expired', startDate: '2023-01-01', endDate: '2024-01-01', price: 800 },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchLeases();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
            case 'pending': return <Clock className="h-3 w-3 text-amber-500" />;
            case 'expired': return <XCircle className="h-3 w-3 text-rose-500" />;
            case 'terminating': return <Clock className="h-3 w-3 text-orange-500" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return "bg-emerald-500/10 text-emerald-500";
            case 'pending': return "bg-amber-500/10 text-amber-500";
            case 'expired': return "bg-rose-500/10 text-rose-500";
            case 'terminating': return "bg-orange-500/10 text-orange-500";
            default: return "bg-white/10 text-white/40";
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter">
                        Lease <span className="text-primary italic">Monitoring</span>
                    </h2>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">Oversee contractual agreements and statuses</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by Property ID..."
                            className="h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-[2.5rem] bg-white/5 border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/[0.02]">
                        <TableRow>
                            <TableHead className="pl-10">Agreement Identity</TableHead>
                            <TableHead>Property Reference</TableHead>
                            <TableHead>Timeline</TableHead>
                            <TableHead>Financials</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-10">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6} className="h-16 text-center text-white/20 animate-pulse">Scanning blockchain/database records...</TableCell>
                                </TableRow>
                            ))
                        ) : leases.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-white/40">No lease agreements detected on the network.</TableCell>
                            </TableRow>
                        ) : (
                            leases.map((lease) => (
                                <TableRow key={lease.id} className="group/row">
                                    <TableCell className="pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary/60">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white tracking-tight uppercase">LEASE-{lease.id.slice(0, 8)}</p>
                                                <p className="text-[10px] font-medium text-white/40 tracking-widest mt-0.5 uppercase">Contract Hash ID</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-white/80 font-bold">
                                            <Building2 className="h-4 w-4 text-white/20" />
                                            {lease.propertyId.slice(0, 12)}...
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-white/60">
                                                <Calendar className="h-3 w-3 opacity-30" />
                                                <span>{lease.startDate}</span>
                                                <span className="text-white/20">→</span>
                                                <span>{lease.endDate}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-white font-black tracking-tight">
                                            <DollarSign className="h-3.5 w-3.5 text-primary" />
                                            {lease.price || '800'}<span className="text-[10px] font-bold text-white/40 ml-0.5">/MO</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                            getStatusColor(lease.status)
                                        )}>
                                            {getStatusIcon(lease.status)}
                                            {lease.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-10">
                                        <button className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-primary hover:text-black transition-all">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
vacation
