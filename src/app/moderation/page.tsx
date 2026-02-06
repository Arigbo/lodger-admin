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
import { collection, query, getDocs, limit, doc, updateDoc } from 'firebase/firestore';
import {
    AlertTriangle,
    Search,
    Flag,
    CheckCircle,
    MessageSquare,
    User,
    ShieldAlert,
    Clock,
    Eye,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserReport {
    id: string;
    reportedUserId: string;
    reportedUserName: string;
    reporterId: string;
    reason: string;
    description: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: any;
}

export default function ModerationPage() {
    const [reports, setReports] = useState<UserReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchReports() {
            try {
                const q = query(collection(db, 'userReports'), limit(50));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    console.log("No reports found in 'userReports' collection.");
                }
                const reportsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as UserReport[];
                setReports(reportsList);
            } catch (err: any) {
                console.error("Error fetching reports:", err);
                setError(err.message || "Unknown error fetching data");
            } finally {
                setLoading(false);
            }
        }
        fetchReports();
    }, []);

    const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
        try {
            const reportRef = doc(db, 'userReports', reportId);
            await updateDoc(reportRef, { status });
            setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
        } catch (error) {
            console.error("Error updating report:", error);
            alert("Failed to update report status.");
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter">
                        Platform <span className="text-primary italic">Moderation</span>
                    </h2>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">Investigate reports and maintain security</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">{reports.filter(r => r.status === 'pending').length} Active Reports</span>
                    </div>
                </div>
            </div>

            <div className="rounded-[2.5rem] bg-white/5 border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/[0.02]">
                        <TableRow>
                            <TableHead className="pl-10">Violation Details</TableHead>
                            <TableHead>Target User</TableHead>
                            <TableHead>Investigation Status</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead className="text-right pr-10">Moderation Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={5} className="h-24 text-center text-white/20 animate-pulse">Running security audit...</TableCell>
                                </TableRow>
                            ))
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-red-500 font-bold">
                                    Error loading reports: {error}
                                    <br />
                                    <span className="text-xs text-white/40 font-normal">Check console for details. Ensure you are logged in as admin@lodger.com</span>
                                </TableCell>
                            </TableRow>
                        ) : reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-white/40">No pending security reports currently detected.</TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id} className="group/row">
                                    <TableCell className="pl-10 py-6 max-w-md">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 mt-1">
                                                <ShieldAlert className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-rose-500/10 text-rose-500">
                                                        {report.reason}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-white/90 leading-snug line-clamp-2">
                                                    {report.description}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white tracking-tight">{report.reportedUserName || 'Anonymous'}</p>
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">ID: {report.reportedUserId.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                            report.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                                                report.status === 'resolved' ? "bg-emerald-500/10 text-emerald-500" : "bg-white/10 text-white/40"
                                        )}>
                                            <Clock className="h-3 w-3" />
                                            {report.status}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Awaiting Review</span>
                                    </TableCell>
                                    <TableCell className="text-right pr-10">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleResolveReport(report.id, 'resolved')}
                                                className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5 group-hover/row:scale-105"
                                                title="Resolve Report"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleResolveReport(report.id, 'dismissed')}
                                                className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                                title="Dismiss Report"
                                            >
                                                <Flag className="h-4 w-4" />
                                            </button>
                                            <button className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/[0.07] transition-all">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <MessageSquare className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black uppercase tracking-tighter">Property <span className="text-primary italic">Reviews</span></h4>
                            <p className="text-sm text-white/40 font-bold uppercase tracking-widest mt-1">Manage tenant feedback & comments</p>
                        </div>
                    </div>
                    <button className="h-12 w-12 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-black transition-all">
                        <ArrowUpRight className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Safety Score</p>
                    <div className="flex items-center gap-4">
                        <h3 className="text-4xl font-black tracking-tighter italic text-emerald-500">98.4%</h3>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[98.4%] shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

