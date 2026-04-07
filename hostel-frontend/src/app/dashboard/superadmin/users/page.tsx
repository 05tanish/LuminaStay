"use client";

import { useState, useDeferredValue } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search, Trash2, Eye, UserX, Building2, Bed, CreditCard,
  MessageSquareWarning, Phone, Mail, Calendar, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useAllUsers(search: string, page: number) {
  return useQuery({
    queryKey: ["superadmin-users", search, page],
    queryFn: async () => {
      const { data } = await api.get("/admin/users", {
        params: { search, page, limit: 20 },
      });
      return data.data; // { users, pagination }
    },
    staleTime: 20000,
    refetchInterval: 60000,
  });
}

function useUserDetail(userId: string | null) {
  return useQuery({
    queryKey: ["user-detail", userId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });
}

function useHardDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/admin/users/${userId}/hard`);
      return data;
    },
    onSuccess: () => {
      toast.success("User permanently deleted");
      qc.invalidateQueries({ queryKey: ["superadmin-users"] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to delete user"),
  });
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
    ADMIN: "bg-indigo-100 text-indigo-700 border-indigo-200",
    USER: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };
  return (
    <Badge variant="outline" className={styles[role] ?? ""}>
      {role}
    </Badge>
  );
}

// ─── User Detail Dialog ───────────────────────────────────────────────────────

function UserDetailDialog({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: user, isLoading } = useUserDetail(userId);
  const hardDelete = useHardDeleteUser();

  const handleHardDelete = () => {
    if (!confirm(`Permanently delete ${user?.name}? This cannot be undone.`)) return;
    hardDelete.mutate(userId, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Full profile and activity for this user.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p>
                  <p className="font-semibold text-lg">{user.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.email}
                  {user.emailVerified && (
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {user.phone ?? "—"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Role</p>
                  <RoleBadge role={user.role} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {user.hostel?.name ?? "No hostel assigned"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bed className="h-4 w-4" />
                  {user.room ? `Room ${user.room.roomNo}` : "No room"} · {user.bed ? `Bed ${user.bed.bedNo}` : "No bed"}
                </div>
              </div>
            </div>

            {/* Family Details */}
            {user.userDetails && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-semibold">Family Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {user.userDetails.fatherName && <span>Father: {user.userDetails.fatherName}</span>}
                  {user.userDetails.fatherPhone && <span>Father Phone: {user.userDetails.fatherPhone}</span>}
                  {user.userDetails.motherName && <span>Mother: {user.userDetails.motherName}</span>}
                  {user.userDetails.motherPhone && <span>Mother Phone: {user.userDetails.motherPhone}</span>}
                  {user.userDetails.parentAddress && (
                    <span className="col-span-2">Address: {user.userDetails.parentAddress}</span>
                  )}
                </div>
              </div>
            )}

            <Tabs defaultValue="complaints">
              <TabsList>
                <TabsTrigger value="complaints">
                  <MessageSquareWarning className="h-4 w-4 mr-1" />
                  Complaints ({user.complaints?.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="fees">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Fees ({user.monthlyFees?.length ?? 0})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="complaints" className="mt-3 space-y-2">
                {user.complaints?.length > 0 ? (
                  user.complaints.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                      <span className="font-medium">{c.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(c.createdAt), "MMM d")}
                        </span>
                        <Badge variant={c.status === "RESOLVED" ? "default" : c.status === "IN_PROGRESS" ? "secondary" : "destructive"} className="text-xs">
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No complaints.</p>
                )}
              </TabsContent>
              <TabsContent value="fees" className="mt-3 space-y-2">
                {user.monthlyFees?.length > 0 ? (
                  user.monthlyFees.map((f: any) => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                      <span className="font-medium">{f.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">₹{f.amount.toLocaleString("en-IN")}</span>
                        <Badge variant={f.status === "PAID" ? "default" : "destructive"} className="text-xs">
                          {f.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No fee records.</p>
                )}
              </TabsContent>
            </Tabs>

            {/* Danger Zone */}
            <div className="rounded-lg border border-rose-200 dark:border-rose-800 p-4 space-y-2">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Danger Zone</p>
              <p className="text-xs text-muted-foreground">
                Permanently deletes this account and all associated data. This cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={handleHardDelete}
                disabled={hardDelete.isPending}
              >
                <UserX className="h-4 w-4" />
                {hardDelete.isPending ? "Deleting..." : "Permanently Delete Account"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">User not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperAdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const hardDelete = useHardDeleteUser();

  const { data, isLoading } = useAllUsers(deferredSearch, page);
  const users: any[] = data?.users ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
        <p className="text-muted-foreground">
          Platform-wide user management. {pagination?.total ?? 0} total users.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Hostel</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.phone ?? "—"}</TableCell>
                    <TableCell><RoleBadge role={user.role} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.hostel?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.room ? `Room ${user.room.roomNo}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="View full details"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                          title="Permanently delete"
                          disabled={hardDelete.isPending}
                          onClick={() => {
                            if (confirm(`Permanently delete ${user.name}? This cannot be undone.`)) {
                              hardDelete.mutate(user.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-16">
                  <ShieldCheck className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} users</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedUserId && (
        <UserDetailDialog userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
