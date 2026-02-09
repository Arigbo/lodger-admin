"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  limit,
} from "firebase/firestore";
import {
  Search,
  UserX,
  MoreVertical,
  Filter,
  Shield,
  GraduationCap,
  Home,
  Mail,
  Calendar,
  MessageSquare,
  XCircle,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { addDoc, serverTimestamp } from "firebase/firestore";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "landlord" | "student";
  createdAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Messaging State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // ... existing useEffect ...
    async function fetchUsers() {
      try {
        const q = query(collection(db, "users"), limit(50));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          console.log("No users found in 'users' collection.");
        }
        const usersList = querySnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserProfile[];
        setUsers(usersList);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.message || "Unknown error fetching data");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this user? This action cannot be undone.",
      )
    ) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter((u) => u.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Check permissions.");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageText.trim() || !auth.currentUser) return;

    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        senderId: auth.currentUser.uid,
        recipientId: selectedUser.id,
        text: messageText,
        timestamp: serverTimestamp(),
        read: false,
        participantIds: [auth.currentUser.uid, selectedUser.id],
      });

      await addDoc(collection(db, "notifications"), {
        userId: selectedUser.id,
        title: "New Admin Message",
        message:
          messageText.length > 60
            ? messageText.substring(0, 57) + "..."
            : messageText,
        type: "info",
        read: false,
        createdAt: new Date().toISOString(),
        link: "/student/messages", // Assuming there's a messages page or notifications
      });

      // Allow simulated delay for UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      setMessageText("");
      setSelectedUser(null);
      alert("Message transmitted successfully.");
    } catch (err: any) {
      console.error("Error sending message:", err);
      alert("Failed to transmit message: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">
            User <span className="text-primary italic">Management</span>
          </h2>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">
            Manage accounts and platform access
          </p>
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
                  <TableCell
                    colSpan={5}
                    className="h-16 text-center text-white/20 animate-pulse"
                  >
                    Loading data records...
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-red-500 font-bold"
                >
                  Error loading users: {error}
                  <br />
                  <span className="text-xs text-white/40 font-normal">
                    Check console for details. Ensure you are logged in as
                    admin@lodger.com
                  </span>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-white/40"
                >
                  No user records found matching criteria.
                </TableCell>
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
                        <Link
                          href={`/users/${user.id}`}
                          className="font-bold text-white tracking-tight hover:text-primary transition-colors cursor-pointer"
                        >
                          {user.name || "Anonymous"}
                        </Link>
                        <p className="text-[11px] font-medium text-white/40 flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        user.role === "landlord"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-blue-500/10 text-blue-500",
                      )}
                    >
                      {user.role === "landlord" ? (
                        <Home className="h-3 w-3" />
                      ) : (
                        <GraduationCap className="h-3 w-3" />
                      )}
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="h-3.5 w-3.5 opacity-50" />
                      <span className="text-xs font-bold">
                        {user.createdAt || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">
                        Active
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all"
                        title="Message User"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
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

      {/* Message Dialog */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">
                  Message <span className="text-primary italic">User</span>
                </h3>
                <p className="text-sm font-bold text-white/40">
                  Sending to: {selectedUser.name}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-4">
                  Message Content
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your official communication here..."
                  className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={sending || !messageText.trim()}
                className="w-full h-14 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Transmission
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
