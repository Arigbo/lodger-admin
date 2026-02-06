'use client';

import React, { useState } from 'react';
import { auth, db, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, getDocs, query, collection, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, AlertCircle, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showContactModal, setShowContactModal] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const router = useRouter();

    const checkAdminLimit = async () => {
        const q = query(collection(db, 'admin_users'));
        const snapshot = await getDocs(q);
        return snapshot.size;
    };

    const isAuthorizedAdmin = async (uid: string) => {
        const docRef = doc(db, 'admin_users', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    };

    const simulateIndustrialRedirect = async (path: string) => {
        setIsRedirecting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push(path);
    };

    const handleAuthAction = async (user: User) => {
        const authorized = await isAuthorizedAdmin(user.uid);

        if (authorized) {
            await simulateIndustrialRedirect('/overview');
            return;
        }

        const count = await checkAdminLimit();
        if (count >= 2) {
            await auth.signOut();
            setShowContactModal(true);
            setIsRedirecting(false);
            return;
        }

        // If limit not reached, register as new admin (fallback auto-reg)
        await setDoc(doc(db, 'admin_users', user.uid), {
            email: user.email,
            createdAt: new Date().toISOString()
        });
        await simulateIndustrialRedirect('/overview');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await handleAuthAction(userCredential.user);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Authentication failed');
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await handleAuthAction(result.user);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Google Sign-In failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative font-sans">
             {/* Redirect Overlay */}
             {isRedirecting && (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#050505] animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 animate-pulse">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Establishing Protocol</h3>
                    <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Connecting to Secure Hub...</span>
                    </div>
                </div>
            )}

            {/* Access Denied Modal */}
            {showContactModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-sm w-full relative animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <AlertCircle className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Access Denied</h3>
                            <p className="text-white/60 font-medium">Administrator limit reached. Please contact system owner for recruitment.</p>
                            <button onClick={() => setShowContactModal(false)} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all mt-4">Dismiss</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-black mb-4">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Admin <span className="text-primary italic">Login</span>
                    </h2>
                    <p className="mt-2 text-sm text-white/40 font-bold uppercase tracking-widest">Secure Access Protocol</p>
                </div>

                <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">Admin Identity</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-14 bg-black/40 border border-white/5 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 ml-1">Secure Passkey</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-14 bg-black/40 border border-white/5 rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isRedirecting}
                            className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Authorize'}
                        </button>
                    </form>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-white/20">
                            <span className="bg-[#050505] px-4">Cloud Auth</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading || isRedirecting}
                        className="w-full h-14 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                        </svg>
                        <span className="uppercase tracking-widest text-xs font-black">Google Authorization</span>
                    </button>

                    <div className="text-center pt-2">
                        <Link href="/auth/signup" className="group text-[10px] font-black text-white/40 hover:text-primary uppercase tracking-widest transition-all inline-flex items-center gap-2">
                            Request New Access Protocol <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
