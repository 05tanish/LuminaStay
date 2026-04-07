"use client";

import { useAuthStore } from "@/store/auth-store";
import { useComplaints, useAdminComplaints, useUsers, useRooms, useHostels } from "@/hooks/use-api";
import { useHostelStats } from "@/lib/api-hooks";
import { StatCard } from "@/components/stat-card";
import { Users, Bed, MessageSquareWarning, CreditCard, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: complaintsData, isLoading: complaintsLoading } = useAdminComplaints();
  const { data: roomsData, isLoading: roomsLoading } = useRooms(user?.hostelId);
  const { data: statsData, isLoading: statsLoading } = useHostelStats(user?.hostelId || "");

  const totalUsers = usersData?.pagination?.total ?? usersData?.total ?? 0;
  const totalComplaints = complaintsData?.pagination?.total ?? complaintsData?.total ?? 0;
  const pendingFees = statsData?.pendingFees ?? 0;
  const openComplaints = (complaintsData?.complaints ?? complaintsData?.data ?? []).filter((c: any) => c.status === "OPEN").length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, <span className="font-medium text-foreground">{user?.name}</span>. Here's your overview for{" "}
          <span className="font-medium text-indigo-500">{(user as any)?.hostel?.name || "your assigned hostel"}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Residents"
          value={totalUsers}
          description="Active hostel members"
          icon={<Users className="h-4 w-4 text-indigo-500" />}
          loading={usersLoading}
        />
        <StatCard
          title="Open Complaints"
          value={openComplaints}
          description="Require attention"
          icon={<MessageSquareWarning className="h-4 w-4 text-rose-500" />}
          loading={complaintsLoading}
        />
        <StatCard
          title="Rooms"
          value={Array.isArray(roomsData) ? roomsData.length : 0}
          description="Total configured rooms"
          icon={<Bed className="h-4 w-4 text-emerald-500" />}
          loading={roomsLoading}
        />
        <StatCard
          title="Pending Fees"
          value={pendingFees}
          description="Unpaid this cycle"
          icon={<CreditCard className="h-4 w-4 text-amber-500" />}
          loading={statsLoading}
        />
      </div>

      {/* Recent complaints preview */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquareWarning className="h-5 w-5 text-rose-500" />
          Recent Complaints
        </h2>
        {complaintsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {(complaintsData?.complaints ?? complaintsData?.data ?? []).slice(0, 5).map((c: any) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {c.user?.name ?? "Unknown"} · {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    c.status === "OPEN"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      : c.status === "IN_PROGRESS"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
            {(complaintsData?.complaints ?? complaintsData?.data ?? []).length === 0 && (
              <p className="text-center text-muted-foreground py-6 text-sm">No complaints yet — great job! 🎉</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
