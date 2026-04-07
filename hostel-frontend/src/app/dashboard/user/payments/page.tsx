"use client";

import { useState } from "react";
import { useMyFees } from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { CreditCard, IndianRupee } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserPaymentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyFees(page);

  const fees: any[] = data?.fees ?? data?.data ?? [];
  const total: number = data?.pagination?.total ?? data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const totalDue = fees
    .filter((f) => f.status !== "PAID")
    .reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Payments</h1>
        <p className="text-muted-foreground text-sm">Monthly fee history and outstanding dues.</p>
      </div>

      {/* Summary card */}
      {!isLoading && totalDue > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Outstanding Balance</p>
            <p className="text-3xl font-bold text-amber-900 dark:text-amber-200 mt-1">
              ₹{totalDue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Please pay at the hostel office or contact your admin.
            </p>
          </div>
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
            <IndianRupee className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      )}

      {/* Fees list */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          : fees.map((fee) => (
              <div key={fee.id} className="rounded-2xl border bg-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${fee.status === "PAID" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
                    <CreditCard className={`h-5 w-5 ${fee.status === "PAID" ? "text-emerald-600" : "text-amber-600"}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{fee.month}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due {new Date(fee.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {fee.paidAt && ` · Paid ${new Date(fee.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg">₹{fee.amount.toLocaleString("en-IN")}</span>
                  <StatusBadge status={fee.status} />
                </div>
              </div>
            ))}
        {!isLoading && fees.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No fee records yet.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
