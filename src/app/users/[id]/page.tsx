"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Trash2,
  MessageSquare,
  Send,
  Loader2,
  Home,
  GraduationCap,
  FileText,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "landlord" | "student";
  createdAt?: string;
  verified?: boolean;
  banned?: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);

  // Stats
  const [userStats, setUserStats] = useState({
    properties: 0,
    leases: 0,
    reports: 0,
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        console.log("Fetching user data for:", userId);
        console.log("Current auth user:", auth.currentUser?.email);

        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
          setError("User not found");
          setLoading(false);
          return;
        }

        const userData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
        setUser(userData);

        // Fetch user stats
        console.log("Fetching user stats...");
        try {
          const [propertiesSnap, leasesSnap, reportsSnap] = await Promise.all([
            getDocs(
              query(
                collection(db, "properties"),
                where("landlordId", "==", userId),
              ),
            ),
            getDocs(
              query(
                collection(db, "leaseAgreements"),
                where("tenantId", "==", userId),
              ),
            ),
            getDocs(
              query(
                collection(db, "userReports"),
                where("reportedUserId", "==", userId),
              ),
            ),
          ]);

          setUserStats({
            properties: propertiesSnap.size,
            leases: leasesSnap.size,
            reports: reportsSnap.size,
          });
          console.log("Stats fetched successfully");
        } catch (statsError: any) {
          console.error("Error fetching stats:", statsError);
          // Don't fail the whole page if stats fail
          setUserStats({ properties: 0, leases: 0, reports: 0 });
        }
      } catch (err: any) {
        console.error("Error fetching user:", err);
        console.error("Error code:", err.code);
        console.error("Error message:", err.message);
        setError(err.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  const handleVerify = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", userId), { verified: true });

      await addDoc(collection(db, "notifications"), {
        userId: userId,
        title: "Account Verified",
        message:
          "Your account has been officially verified by the Lodger team.",
        type: "success",
        read: false,
        createdAt: new Date().toISOString(),
        link:
          user.role === "landlord" ? "/landlord/account" : "/student/account",
      });

      setUser({ ...user, verified: true });
      alert("User verified successfully");
    } catch (err: any) {
      console.error("Error verifying user:", err);
      alert("Failed to verify user: " + err.message);
    }
  };

  const handleBan = async () => {
    if (
      !user ||
      !window.confirm(
        `Are you sure you want to ${user.banned ? "unban" : "ban"} this user?`,
      )
    )
      return;
    try {
      await updateDoc(doc(db, "users", userId), { banned: !user.banned });

      if (!user.banned) {
        // If we're banning them
        await addDoc(collection(db, "notifications"), {
          userId: userId,
          title: "Account Restricted",
          message:
            "Your account access has been restricted by the moderation team.",
          type: "warning",
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else {
        // If we're unbanning them
        await addDoc(collection(db, "notifications"), {
          userId: userId,
          title: "Account Restored",
          message: "Your account access has been fully restored.",
          type: "success",
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      setUser({ ...user, banned: !user.banned });
      alert(`User ${user.banned ? "unbanned" : "banned"} successfully`);
    } catch (err: any) {
      console.error("Error updating ban status:", err);
      alert("Failed to update ban status: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this user? This action will remove their access and all associated data, and cannot be undone.",
      )
    )
      return;
    try {
      const response = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId }),
      });

      const data = await response.json();

      if (data.success) {
        alert("User deleted successfully");
        router.push("/users");
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user: " + err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !auth.currentUser) return;

    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        senderId: auth.currentUser.uid,
        recipientId: userId,
        text: messageText,
        timestamp: serverTimestamp(),
        read: false,
        participantIds: [auth.currentUser.uid, userId],
      });

      await addDoc(collection(db, "notifications"), {
        userId: userId,
        title: "New Admin Message",
        message:
          messageText.length > 60
            ? messageText.substring(0, 57) + "..."
            : messageText,
        type: "info",
        read: false,
        createdAt: new Date().toISOString(),
        link: user?.role === "landlord" ? "/landlord" : "/student", // Adjust as needed
      });

      setMessageText("");
      setShowMessageBox(false);
      alert("Message sent successfully");
    } catch (err: any) {
      console.error("Error sending message:", err);
      alert("Failed to send message: " + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-10 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-center max-w-2xl mx-auto mt-20">
        <p className="text-rose-500 font-bold text-xl mb-2">
          Error Loading User
        </p>
        <p className="text-white/60">{error || "User not found"}</p>
        <button
          onClick={() => router.push("/users")}
          className="mt-6 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/users")}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            User <span className="text-primary italic">Profile</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">
            Detailed account information & actions
          </p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">
                  {user.name}
                </h2>
                <p className="text-white/60 flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest",
                user.role === "landlord"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-blue-500/10 text-blue-500",
              )}
            >
              {user.role === "landlord" ? (
                <Home className="h-3 w-3 inline mr-2" />
              ) : (
                <GraduationCap className="h-3 w-3 inline mr-2" />
              )}
              {user.role}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white/5">
              <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                Joined
              </p>
              <p className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/40" />
                {user.createdAt || "N/A"}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5">
              <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                Status
              </p>
              <p className="text-lg font-bold">
                {user.banned ? (
                  <span className="text-rose-500">Banned</span>
                ) : user.verified ? (
                  <span className="text-emerald-500">Verified</span>
                ) : (
                  <span className="text-amber-500">Unverified</span>
                )}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5">
              <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                User ID
              </p>
              <p className="text-sm font-mono font-bold text-white/60">
                {user.id.slice(0, 12)}...
              </p>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="text-center p-4 rounded-xl bg-white/5">
              <Building2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-black">{userStats.properties}</p>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">
                Properties
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <FileText className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-black">{userStats.leases}</p>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">
                Leases
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <Shield className="h-6 w-6 text-rose-400 mx-auto mb-2" />
              <p className="text-2xl font-black">{userStats.reports}</p>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">
                Reports
              </p>
            </div>
          </div>

          {/* Message Box */}
          {showMessageBox && (
            <div className="p-6 rounded-2xl bg-white/5 border border-primary/20 space-y-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-black uppercase tracking-tight">
                  Send Message
                </h3>
              </div>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="w-full h-24 bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  className="flex-1 h-12 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? "Sending..." : "Send"}
                </button>
                <button
                  onClick={() => setShowMessageBox(false)}
                  className="px-6 h-12 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-bold uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions Panel */}
        <div className="space-y-4">
          <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6">
              Admin <span className="text-primary italic">Actions</span>
            </h3>

            <button
              onClick={() => setShowMessageBox(!showMessageBox)}
              className="w-full h-14 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
            >
              <MessageSquare className="h-4 w-4" />
              Message User
            </button>

            {!user.verified && (
              <button
                onClick={handleVerify}
                className="w-full h-14 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
              >
                <CheckCircle className="h-4 w-4" />
                Verify User
              </button>
            )}

            <button
              onClick={handleBan}
              className={cn(
                "w-full h-14 rounded-xl transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3",
                user.banned
                  ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                  : "bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black",
              )}
            >
              <Ban className="h-4 w-4" />
              {user.banned ? "Unban User" : "Ban User"}
            </button>

            <button
              onClick={handleDelete}
              className="w-full h-14 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
            >
              <Trash2 className="h-4 w-4" />
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
