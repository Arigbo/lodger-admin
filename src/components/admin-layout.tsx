"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Bell, Search, User, Loader2, XCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
  orderBy,
} from "firebase/firestore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showBadge, setShowBadge] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const isAuthPath = pathname.startsWith("/auth");
      const isRootPath = pathname === "/";

      if (!currentUser && !isAuthPath && !isRootPath) {
        router.push("/auth/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  useEffect(() => {
    if (!user || pathname.startsWith("/auth")) return;

    // Listen for new pending reports
    const q = query(
      collection(db, "userReports"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      limit(1),
    );

    let initialLoad = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (initialLoad) {
        initialLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newReport = { id: change.doc.id, ...change.doc.data() };
          setNotifications((prev) => [newReport, ...prev]);
          setShowBadge(true);

          // Trigger email notification via API
          fetch("/api/notify-admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ report: newReport }),
          }).catch((err) => console.error("Email notification failed:", err));
        }
      });
    });

    return () => unsubscribe();
  }, [user, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user && (pathname.startsWith("/auth") || pathname === "/")) {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search everything..."
              className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder:text-white/30"
            />
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (pathname !== "/moderation") router.push("/moderation");
                setShowBadge(false);
              }}
              className="relative p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/60 hover:text-white group"
            >
              <Bell className="h-5 w-5" />
              {showBadge && (
                <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-[#050505] shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse" />
              )}
            </button>

            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black uppercase tracking-tight">
                  {user.email?.split("@")[0] || "Admin User"}
                </p>
                <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mt-0.5">
                  Super Admin
                </p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-black shadow-lg shadow-primary/20">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-10 flex-1 relative">
          {children}

          {/* Real-time Toast Notification */}
          <div className="fixed bottom-10 right-10 z-[100] space-y-4 pointer-events-none">
            {notifications.slice(0, 3).map((notif, i) => (
              <div
                key={notif.id}
                className="w-80 p-6 rounded-2xl bg-[#0a0a0a] border border-primary/20 shadow-2xl shadow-primary/10 animate-in slide-in-from-right-10 fade-in duration-500 pointer-events-auto"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-black uppercase tracking-tight text-white mb-1">
                      New Report Detected
                    </h5>
                    <p className="text-xs text-white/40 truncate mb-3">
                      Reason: {notif.reason}
                    </p>
                    <button
                      onClick={() => {
                        router.push("/moderation");
                        setNotifications((prev) =>
                          prev.filter((n) => n.id !== notif.id),
                        );
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all"
                    >
                      Investigate Now
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.filter((n) => n.id !== notif.id),
                      )
                    }
                    className="text-white/20 hover:text-white transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
