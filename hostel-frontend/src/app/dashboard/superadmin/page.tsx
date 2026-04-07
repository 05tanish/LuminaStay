"use client";

import { useAuthStore } from "@/store/auth-store";
import { usePlatformStats, useHostels, useBroadcastNotification } from "@/hooks/use-api";
import { StatCard } from "@/components/stat-card";
import {
  Hotel,
  Users,
  MessageSquareWarning,
  IndianRupee,
  Send,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SuperAdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: hostels, isLoading: hostelsLoading } = useHostels();
  const { mutate: broadcastNotification, isPending: broadcasting } = useBroadcastNotification();

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastHostelId, setBroadcastHostelId] = useState("all");

  const hostelList: any[] = hostels?.hostels ?? (Array.isArray(hostels) ? hostels : []);

  const handleBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    broadcastNotification(
      {
        title: broadcastTitle,
        message: broadcastMessage,
        ...(broadcastHostelId !== "all" && { hostelId: broadcastHostelId }),
      } as any,
      {
        onSuccess: () => {
          setBroadcastOpen(false);
          setBroadcastTitle("");
          setBroadcastMessage("");
          setBroadcastHostelId("all");
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform-wide overview — Welcome,{" "}
            <span className="font-medium text-foreground">{user?.name}</span>.
          </p>
        </div>

        {/* Broadcast Notification */}
        <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" />}>
              <Send className="h-4 w-4" /> Broadcast
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Broadcast Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Target</Label>
                <Select value={broadcastHostelId} onValueChange={(val) => setBroadcastHostelId(val ?? "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌐 All Users (Global)</SelectItem>
                    {hostelList.map((h: any) => (
                      <SelectItem key={h.id} value={h.id}>
                        🏠 {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. Maintenance Update"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Write your notification message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={handleBroadcast}
                disabled={broadcasting || !broadcastTitle.trim() || !broadcastMessage.trim()}
              >
                {broadcasting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Broadcast
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Hostels"
          value={stats?.totalHostels ?? 0}
          description="Active properties"
          icon={<Hotel className="h-4 w-4 text-indigo-500" />}
          loading={statsLoading}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          description="Across all hostels"
          icon={<Users className="h-4 w-4 text-emerald-500" />}
          loading={statsLoading}
        />
        <StatCard
          title="Open Complaints"
          value={stats?.openComplaints ?? 0}
          description="Require attention"
          icon={<MessageSquareWarning className="h-4 w-4 text-rose-500" />}
          loading={statsLoading}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
          description="All-time collections"
          icon={<IndianRupee className="h-4 w-4 text-amber-500" />}
          loading={statsLoading}
        />
      </div>

      {/* Recent Complaints */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquareWarning className="h-5 w-5 text-rose-500" />
          Recent Complaints
        </h2>
        {statsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {(stats?.recentComplaints ?? []).map((c: any) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {c.user?.name ?? "Unknown"} · {c.hostel?.name ?? "—"} ·{" "}
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    c.status === "OPEN"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      : c.status === "IN_PROGRESS"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
            {(stats?.recentComplaints ?? []).length === 0 && (
              <p className="text-center text-muted-foreground py-6 text-sm">
                No complaints — everything is running smooth! 🎉
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Hostel Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Hostels</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/superadmin/hostels")}
          >
            View All →
          </Button>
        </div>
        {hostelsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hostelList.slice(0, 6).map((hostel) => (
              <div
                key={hostel.id}
                className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer space-y-2"
                onClick={() => router.push(`/dashboard/superadmin/hostels/${hostel.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <Hotel className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-bold">{hostel.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{hostel.address}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{hostel._count?.rooms ?? hostel.rooms?.length ?? 0} rooms</span>
                  <span>{hostel._count?.users ?? hostel.users?.length ?? 0} residents</span>
                </div>
              </div>
            ))}
            {hostelList.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <Hotel className="h-10 w-10 mx-auto mb-3 opacity-30" />
                No hostels yet. Create one from the Hostels page.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
