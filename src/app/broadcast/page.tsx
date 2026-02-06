'use client';

import React, { useState } from 'react';
import {
    Send,
    Users,
    Filter,
    Target,
    CheckCircle2,
    AlertCircle,
    Info,
    ShieldCheck,
    Mail,
    Smartphone,
    Search,
    MessageSquare,
    ChevronDown,
    Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, getIdToken } from 'firebase/auth';

const targetFilters = [
    { id: 'all', name: 'Everyone', icon: Users },
    { id: 'landlords', name: 'Landlords Only', icon: ShieldCheck },
    { id: 'students', name: 'Students Only', icon: Smartphone },
    { id: 'no-stripe', name: 'Incomplete Stripe', icon: AlertCircle },
];

export default function BroadcastPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('all');
    const [type, setType] = useState('info'); // info, warning, success
    const [isSending, setIsSending] = useState(false);
    const [sendEmail, setSendEmail] = useState(false);
    const [sentStatus, setSentStatus] = useState<null | 'success' | 'error'>(null);
    const [sentCount, setSentCount] = useState(0);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setIsSending(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                console.error("No authenticated user found for broadcast.");
                setSentStatus('error');
                return;
            }

            const token = await getIdToken(user);

            // Dynamic API URL: Prioritize env variable, fallback to relative path if on same domain, 
            // or use a smart default for local dev.
            const apiBase = process.env.NEXT_PUBLIC_BROADCAST_API_URL || 
                           (typeof window !== 'undefined' && window.location.port === '3001' 
                            ? 'http://localhost:3000' 
                            : 'https://lodger-ten.vercel.app');
            
            const response = await fetch(`${apiBase}/api/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    message,
                    target,
                    type,
                    sendEmail
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to dispatch broadcast');
            }

            const data = await response.json();
            setSentCount(data.count || 0);
            
            // Log to local history as well
            await addDoc(collection(db, 'broadcastMessages'), {
                title,
                message,
                target,
                type,
                sendEmail,
                recipients: data.count || 0,
                timestamp: serverTimestamp(),
                sentBy: 'Admin Console'
            });

            setSentStatus('success');
            setTitle('');
            setMessage('');
            setTimeout(() => setSentStatus(null), 5000);
        } catch (error) {
            console.error("Error sending broadcast:", error);
            setSentStatus('error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">
                    Targeted <span className="text-primary italic">Broadcast</span>
                </h2>
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">Send intelligent notifications based on system data</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <form onSubmit={handleBroadcast} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-8 relative overflow-hidden">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 pl-1">Broadcast Title</label>
                            <input
                                type="text"
                                placeholder="E.g. System Update or Policy Change"
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-base font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 pl-1">Message Payload</label>
                            <textarea
                                placeholder="Describe the notification content specifically..."
                                className="w-full min-h-[200px] bg-white/5 border border-white/10 rounded-2xl p-6 text-base font-medium text-white/80 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all resize-none leading-relaxed"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 pl-1">Broadcast Velocity</label>
                                <div className="flex gap-2">
                                    {['info', 'warning', 'urgent'].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all",
                                                type === t
                                                    ? "bg-primary border-primary text-black"
                                                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 pl-1">Delivery Protocol</label>
                                <button
                                    type="button"
                                    onClick={() => setSendEmail(!sendEmail)}
                                    className={cn(
                                        "w-full h-14 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3",
                                        sendEmail
                                            ? "bg-white text-black border-white"
                                            : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                                    )}
                                >
                                    <Mail className={cn("h-4 w-4", sendEmail ? "text-black" : "text-white/20")} />
                                    {sendEmail ? "Email Enabled" : "In-App Only"}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full h-20 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-base shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {isSending ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                                        <span>Dispatching Signal...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        Dispatch to {target === 'all' ? 'Entire Grid' : target}
                                    </>
                                )}
                            </button>
                        </div>

                        {sentStatus === 'success' && (
                            <div className="absolute inset-0 bg-primary flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 z-50">
                                <div className="w-20 h-20 rounded-full bg-black/10 flex items-center justify-center mb-6">
                                    <CheckCircle2 className="h-10 w-10 text-black" />
                                </div>
                                <h3 className="text-2xl font-black uppercase text-black tracking-tighter">Broadcast Dispatched</h3>
                                <p className="text-black/60 font-bold uppercase tracking-widest text-[10px] mt-2">Reached {sentCount} nodes across the tactical grid</p>
                            </div>
                        )}
                    </form>
                </div>

                <div className="space-y-8">
                    <div className="p-8 rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="h-5 w-5 text-primary" />
                            <h4 className="text-lg font-black uppercase tracking-tighter">Recipients <span className="text-primary italic">Filter</span></h4>
                        </div>

                        <div className="space-y-2">
                            {targetFilters.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setTarget(f.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all text-left group",
                                        target === f.id
                                            ? "bg-primary/10 border-primary text-white"
                                            : "bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <f.icon className={cn(
                                        "h-5 w-5 transition-transform group-hover:scale-110",
                                        target === f.id ? "text-primary" : "text-white/20"
                                    )} />
                                    <span className="font-bold text-sm tracking-tight">{f.name}</span>
                                    {target === f.id && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                                <Info className="h-5 w-5 text-primary" />
                            </div>
                            <h5 className="font-black uppercase tracking-tighter">Targeting <span className="text-primary italic">IQ</span></h5>
                        </div>
                        <p className="text-sm text-white/40 leading-relaxed font-bold italic tracking-tight">
                            "Selecting 'Students' will automatically include those with active tenancies and those currently searching."
                        </p>
                    </div>

                    <div className="aspect-square rounded-[2.5rem] bg-white/5 border border-white/5 p-8 flex flex-col justify-between italic">
                        <Layout className="h-10 w-10 text-white/10" />
                        <div>
                            <p className="text-2xl font-black uppercase tracking-tighter text-white/10">Broadcast Archive</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/10 mt-2">Historical Logs locked</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

