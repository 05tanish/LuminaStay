"use client";

import { useAuthStore } from "@/store/auth-store";
import { useMyFees, useComplaints, useNotifications } from "@/hooks/use-api";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { CreditCard, MessageSquareWarning, Bell, Bed, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: feesData, isLoading: feesLoading } = useMyFees();
  const { data: complaintsData, isLoading: complaintsLoading } = useComplaints();
  const { data: notifData, isLoading: notifLoading } = useNotifications();

  const fees: any[] = feesData?.data ?? [];
  const pendingFee = fees.find((f) => f.status === "PENDING" || f.status === "OVERDUE");
  const unreadNotifs = (notifData?.data ?? []).filter((n: any) => !n.read).length;
  const myComplaints: any[] = complaintsData?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, <span className="font-medium text-foreground">{user?.name}</span>. Here's your quick overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Room"
          value={user?.roomId ? "Assigned" : "—"}
          description={user?.roomId ? "View your room details" : "Not yet assigned"}
          icon={<Bed className="h-4 w-4 text-indigo-500" />}
        />
        <StatCard
          title="Pending Dues"
          value={pendingFee ? `₹${pendingFee.amount.toLocaleString("en-IN")}` : "None"}
          description={pendingFee ? `Due: ${new Date(pendingFee.dueDate).toLocaleDateString("en-IN")}` : "All clear!"}
          icon={<CreditCard className="h-4 w-4 text-amber-500" />}
          loading={feesLoading}
        />
        <StatCard
          title="My Complaints"
          value={myComplaints.length}
          description={`${myComplaints.filter((c) => c.status === "OPEN").length} open`}
          icon={<MessageSquareWarning className="h-4 w-4 text-rose-500" />}
          loading={complaintsLoading}
        />
        <StatCard
          title="Notifications"
          value={unreadNotifs}
          description="Unread messages"
          icon={<Bell className="h-4 w-4 text-emerald-500" />}
          loading={notifLoading}
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/user/complaints">
          <div className="rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow cursor-pointer group flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquareWarning className="h-4 w-4 text-rose-500" />
                Submit a Complaint
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Report issues with rooms, food, or facilities</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/dashboard/user/payments">
          <div className="rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow cursor-pointer group flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-500" />
                View & Pay Dues
              </h3>
              <p className="text-sm text-muted-foreground mt-1">View monthly fee history and make payments</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent complaints */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Recent Complaints</h2>
          <Link href="/dashboard/user/complaints">
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 -mr-2">
              View all
            </Button>
          </Link>
        </div>
        {complaintsLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : myComplaints.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No complaints submitted yet.</p>
        ) : (
          <div className="divide-y">
            {myComplaints.slice(0, 4).map((c: any) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
