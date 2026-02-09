"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  limit,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
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
  ArrowUpRight,
  XCircle,
  Building2,
  Calendar,
  Mail,
  Home,
  GraduationCap,
  Loader2,
  DollarSign,
  MapPin,
  FileText,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { where } from "firebase/firestore";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "landlord" | "student";
  createdAt?: string;
  verified?: boolean;
  banned?: boolean;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  landlordId: string;
}

interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reporterId: string;
  reason: string;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: any;
}

export default function ModerationPage() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [actionReport, setActionReport] = useState<{
    report: UserReport;
    status: "resolved" | "dismissed";
  } | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const q = query(collection(db, "userReports"), limit(50));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          console.log("No reports found in 'userReports' collection.");
        }
        const reportsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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

  const handleResolveReport = async (
    reportId: string,
    status: "resolved" | "dismissed",
    customMessage?: string,
  ) => {
    try {
      const report = reports.find((r) => r.id === reportId);
      if (!report) return;

      const reportRef = doc(db, "userReports", reportId);
      await updateDoc(reportRef, { status });

      // Messaging Logic
      if (auth.currentUser) {
        if (status === "resolved") {
          // Notify Reporter
          await addDoc(collection(db, "messages"), {
            senderId: "SYSTEM_MODERATION",
            recipientId: report.reporterId,
            text: `Your report against ${report.reportedUserName} has been resolved. Thank you for helping keep Lodger safe.`,
            timestamp: serverTimestamp(),
            read: false,
            participantIds: ["SYSTEM_MODERATION", report.reporterId],
          });

          // Notify Reported User
          await addDoc(collection(db, "messages"), {
            senderId: "SYSTEM_MODERATION",
            recipientId: report.reportedUserId,
            text: `A report against your account has been resolved by our moderation team. Please ensure you continue to follow our community guidelines.`,
            timestamp: serverTimestamp(),
            read: false,
            participantIds: ["SYSTEM_MODERATION", report.reportedUserId],
          });
        } else if (status === "dismissed" && customMessage) {
          // Notify Reporter with custom message
          await addDoc(collection(db, "messages"), {
            senderId: "SYSTEM_MODERATION",
            recipientId: report.reporterId,
            text: `Your report against ${report.reportedUserName} has been reviewed and dismissed. Reason: ${customMessage}`,
            timestamp: serverTimestamp(),
            read: false,
            participantIds: ["SYSTEM_MODERATION", report.reporterId],
          });
        }
      }

      setReports(
        reports.map((r) => (r.id === reportId ? { ...r, status } : r)),
      );
      setActionReport(null);
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
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">
            Investigate reports and maintain security
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              {reports.filter((r) => r.status === "pending").length} Active
              Reports
            </span>
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
              <TableHead className="text-right pr-10">
                Moderation Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-white/20 animate-pulse"
                  >
                    Running security audit...
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-red-500 font-bold"
                >
                  Error loading reports: {error}
                  <br />
                  <span className="text-xs text-white/40 font-normal">
                    Check console for details. Ensure you are logged in as
                    admin@lodger.com
                  </span>
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-white/40"
                >
                  No pending security reports currently detected.
                </TableCell>
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
                        <p className="text-sm font-bold text-white tracking-tight">
                          {report.reportedUserName || "Anonymous"}
                        </p>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                          ID: {report.reportedUserId.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        report.status === "pending"
                          ? "bg-amber-500/10 text-amber-500"
                          : report.status === "resolved"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-white/10 text-white/40",
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {report.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                      Awaiting Review
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          setActionReport({ report, status: "resolved" })
                        }
                        className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5 group-hover/row:scale-105"
                        title="Resolve Report"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setActionReport({ report, status: "dismissed" })
                        }
                        className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                        title="Dismiss Report"
                      >
                        <Flag className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"
                      >
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
              <h4 className="text-xl font-black uppercase tracking-tighter">
                Property <span className="text-primary italic">Reviews</span>
              </h4>
              <p className="text-sm text-white/40 font-bold uppercase tracking-widest mt-1">
                Manage tenant feedback & comments
              </p>
            </div>
          </div>
          <button className="h-12 w-12 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-black transition-all">
            <ArrowUpRight className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
            Safety Score
          </p>
          <div className="flex items-center gap-4">
            <h3 className="text-4xl font-black tracking-tighter italic text-emerald-500">
              98.4%
            </h3>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[98.4%] shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
        </div>
      </div>
      {selectedReport && (
        <ReportDetailDialog
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {actionReport && (
        <ReportActionDialog
          report={actionReport.report}
          status={actionReport.status}
          onClose={() => setActionReport(null)}
          onConfirm={(msg) =>
            handleResolveReport(
              actionReport.report.id,
              actionReport.status,
              msg,
            )
          }
        />
      )}
    </div>
  );
}

function ReportActionDialog({
  report,
  status,
  onClose,
  onConfirm,
}: {
  report: UserReport;
  status: "resolved" | "dismissed";
  onClose: () => void;
  onConfirm: (msg?: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(status === "dismissed" ? message : undefined);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-10 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <XCircle className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-6 mb-8">
          <div
            className={cn(
              "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0",
              status === "resolved"
                ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
                : "bg-rose-500/10 text-rose-500 shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]",
            )}
          >
            {status === "resolved" ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <Flag className="h-8 w-8" />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">
              {status === "resolved" ? "Resolve" : "Dismiss"}{" "}
              <span className="text-primary italic">Report</span>
            </h3>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">
              Target: {report.reportedUserName}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {status === "resolved" ? (
            <div className="p-6 rounded-2xl bg-white/5 border border-emerald-500/20 space-y-3">
              <p className="text-sm font-medium text-white/70 leading-relaxed">
                Resolving this report will notify both the reporter and the
                target user. Automated safety confirmations will be dispatched.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                <ShieldAlert className="h-3 w-3" />
                Standard Security Protocol
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">
                  Reason for Dismissal
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain to the reporter why this report is being dismissed..."
                  className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-6 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-all"
                />
              </div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.15em] px-4 leading-relaxed">
                Your message will be sent directly to the reporter to ensure
                transparent moderation.
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleConfirm}
              disabled={loading || (status === "dismissed" && !message.trim())}
              className={cn(
                "flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2",
                status === "resolved"
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                  : "bg-primary text-black hover:scale-[1.02] active:scale-[0.98]",
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? "Processing..." : `Confirm ${status}`}
            </button>
            <button
              onClick={onClose}
              className="px-8 h-14 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-black uppercase tracking-widest text-xs text-white/40 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportDetailDialog({
  report,
  onClose,
}: {
  report: UserReport;
  onClose: () => void;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const userDoc = await getDoc(doc(db, "users", report.reportedUserId));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
          setUser(userData);

          if (userData.role === "landlord") {
            const q = query(
              collection(db, "properties"),
              where("landlordId", "==", userData.id),
            );
            const snap = await getDocs(q);
            setProperties(
              snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Property),
            );
          } else {
            const q = query(
              collection(db, "leaseAgreements"),
              where("tenantId", "==", userData.id),
            );
            const snap = await getDocs(q);
            setLeases(
              snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lease),
            );
          }
        }
      } catch (err) {
        console.error("Error fetching user details in moderation:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserDetails();
  }, [report.reportedUserId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <XCircle className="h-6 w-6" />
        </button>

        <div className="p-10 overflow-y-auto custom-scrollbar">
          <div className="space-y-10">
            {/* Header Section */}
            <div className="flex items-start gap-8">
              <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group transition-all shrink-0">
                <User className="h-12 w-12 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-4xl font-black uppercase tracking-tighter">
                    Reported <span className="text-primary italic">User</span>
                  </h3>
                  {user && (
                    <div
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                        user.role === "landlord"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-blue-500/10 text-blue-500",
                      )}
                    >
                      {user.role}
                    </div>
                  )}
                </div>
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
                  Identity Investigation & Property Audit
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-white/20">
                  Scanning database records...
                </p>
              </div>
            ) : !user ? (
              <div className="p-8 rounded-3xl bg-rose-500/5 border border-rose-500/10 text-center">
                <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto mb-4" />
                <p className="text-rose-500 font-bold">
                  User Profile Not Found
                </p>
                <p className="text-xs text-white/40 mt-2">
                  This user may have been deleted or the ID is invalid.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Sidebar */}
                <div className="space-y-6">
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                        Full Name
                      </p>
                      <p className="text-xl font-black text-white">
                        {user.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                        Communication
                      </p>
                      <div className="flex items-center gap-2 text-white/60">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm font-bold truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                        Registration
                      </p>
                      <div className="flex items-center gap-2 text-white/60">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-bold">
                          {user.createdAt || "Jan 12, 2024"}
                        </span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        {user.banned ? (
                          <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                        <span
                          className={cn(
                            "text-xs font-black uppercase tracking-widest",
                            user.banned ? "text-rose-500" : "text-emerald-500",
                          )}
                        >
                          Account{" "}
                          {user.banned ? "Suspended" : "In High Standing"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl bg-rose-500/5 border border-rose-500/10">
                    <h4 className="text-xs font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center gap-2">
                      <Flag className="h-3 w-3" />
                      Active Report Details
                    </h4>
                    <div className="space-y-4">
                      <span className="inline-block px-3 py-1 rounded bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                        {report.reason}
                      </span>
                      <p className="text-sm font-medium text-white/70 leading-relaxed italic">
                        "{report.description}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {user.role === "landlord" ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black uppercase tracking-tighter">
                          Property{" "}
                          <span className="text-primary italic">Portfolio</span>
                        </h4>
                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black">
                          {properties.length} Total
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {properties.length > 0 ? (
                          properties.map((p) => (
                            <div
                              key={p.id}
                              className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                  <Building2 className="h-5 w-5" />
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-black text-white/20 uppercase tracking-widest">
                                    Value
                                  </p>
                                  <p className="text-sm font-black text-emerald-500">
                                    ${p.price}/mo
                                  </p>
                                </div>
                              </div>
                              <h5 className="font-bold text-white mb-1 line-clamp-1">
                                {p.title}
                              </h5>
                              <div className="flex items-center gap-1.5 text-white/40">
                                <MapPin className="h-3 w-3" />
                                <span className="text-[10px] font-medium uppercase tracking-widest">
                                  {p.address || "Location Hidden"}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 p-12 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-white/20">
                              No active property listings detected.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black uppercase tracking-tighter">
                          Rental{" "}
                          <span className="text-primary italic">Record</span>
                        </h4>
                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black">
                          {leases.length} Total
                        </span>
                      </div>
                      <div className="space-y-4">
                        {leases.length > 0 ? (
                          leases.map((l) => (
                            <div
                              key={l.id}
                              className="flex items-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all group"
                            >
                              <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 mr-6">
                                <FileText className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-black text-white/20 uppercase tracking-widest mb-1">
                                  Contract ID: {l.id.slice(0, 8)}
                                </p>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2 text-white/60">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span className="text-xs font-bold">
                                      {l.startDate} - {l.endDate}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                  l.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-white/10 text-white/40",
                                )}
                              >
                                {l.status}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-white/20">
                              No lease agreements detected on record.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Footnote */}
                  <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-black uppercase tracking-tight text-white mb-1">
                        Audit Policy Reminder
                      </h5>
                      <p className="text-xs text-white/40 leading-relaxed">
                        Please cross-reference the report description with the
                        user's rental history or property portfolio before
                        taking disciplinary action.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
