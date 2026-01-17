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
import { collection, query, getDocs, deleteDoc, doc, limit } from 'firebase/firestore';
import {
    Search,
    UserX,
    MoreVertical,
    Filter,
    Shield,
    GraduationCap,
    Home,
    Mail,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'landlord' | 'student';
    createdAt?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            try {
                const q = query(collection(db, 'users'), limit(50));
                const querySnapshot = await getDocs(q);
                const usersList = querySnapshot.docs.map((doc: any) => ({
                    id: doc.id,
                    ...doc.data()
                })) as UserProfile[];
                setUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
                // Fallback mock data for demo if permission fails or empty
                setUsers([
                    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'landlord', createdAt: '2024-01-15' },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'student', createdAt: '2024-02-10' },
                    { id: '3', name: 'Alice Johnson', email: 'alice@example.com', role: 'student', createdAt: '2024-03-05' },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                setUsers(users.filter(u => u.id !== userId));
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user. Check permissions.");
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter">
                        User <span className="text-primary italic">Management</span>
                    </h2>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">Manage accounts and platform access</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors">
                        <Filter className="h-5 w-5" />
                    </button>
                    <button className="h-12 px-6 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                        Add Admin
                    </button>
                </div>
            </div>

            <div className="rounded-[2.5rem] bg-white/5 border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/[0.02]">
                        <TableRow>
                            <TableHead className="pl-10">User Identity</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead>Account Status</TableHead>
                            <TableHead className="text-right pr-10">System Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={5} className="h-16 text-center text-white/20 animate-pulse">Loading data records...</TableCell>
                                </TableRow>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-white/40">No user records found matching criteria.</TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="group/row">
                                    <TableCell className="pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                                                <Shield className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white tracking-tight">{user.name || 'Anonymous'}</p>
                                                <p className="text-[11px] font-medium text-white/40 flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                            user.role === 'landlord' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                                        )}>
                                            {user.role === 'landlord' ? <Home className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                                            {user.role}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Calendar className="h-3.5 w-3.5 opacity-50" />
                                            <span className="text-xs font-bold">{user.createdAt || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">Active</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-10">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover/row:opacity-100"
                                                title="Remove User"
                                            >
                                                <UserX className="h-4 w-4" />
                                            </button>
                                            <button className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
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
