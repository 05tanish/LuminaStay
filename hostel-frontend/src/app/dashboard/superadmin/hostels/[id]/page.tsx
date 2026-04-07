"use client";

import { useHostelStats } from "@/lib/api-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Building, AlertTriangle, CheckCircle, IndianRupee, CreditCard } from "lucide-react";

export default function HostelDeepView() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: stats, isLoading, error } = useHostelStats(id);

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground animate-pulse">Loading hostel stats...</div>;
  }

  if (error || !stats) {
    return (
      <div className="py-8 text-center text-red-500">
        Failed to load stats. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hostel Overview Insight</h1>
          <p className="text-muted-foreground">Deep dive into operational metrics for this specific hostel.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.userCount}</div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
              Registered users in this hostel
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Room & Occupancy</CardTitle>
            <Building className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.roomCount} Rooms</div>
            <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
              {stats.occupancyRate.toFixed(1)}% Occupancy ({stats.occupiedBeds}/{stats.totalBeds} Beds)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.complaintCount}</div>
            <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1">
              Lifetime complaints registered
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-900/10 border-indigo-200 dark:border-indigo-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <CheckCircle className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{stats.pendingComplaints}</div>
            <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1">
              Complaints currently actioned or open
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              ₹{(stats.totalRevenue ?? 0).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
              Lifetime collections from payments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-900/10 border-rose-200 dark:border-rose-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <CreditCard className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">{stats.pendingFees ?? 0}</div>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
              Unpaid fee records due
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
