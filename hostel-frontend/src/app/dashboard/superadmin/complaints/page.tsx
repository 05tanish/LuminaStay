"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, MessageSquare, Building2 } from "lucide-react";

function useSuperAdminComplaints(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["superadmin-complaints", page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/complaint/superadmin?page=${page}&limit=${limit}`);
      return data.data;
    },
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

function useUpdateComplaintStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ complaintID, status }: { complaintID: string; status: string }) => {
      const { data } = await api.patch("/complaint/status", { complaintID, status });
      return data;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["superadmin-complaints"] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to update status"),
  });
}

function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ complaintID, content }: { complaintID: string; content: string }) => {
      const { data } = await api.post(`/complaint/${complaintID}/comments`, { content });
      return data;
    },
    onSuccess: () => {
      toast.success("Reply sent");
      qc.invalidateQueries({ queryKey: ["superadmin-complaints"] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to send reply"),
  });
}

export default function SuperAdminComplaintsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSuperAdminComplaints(page);
  const updateStatus = useUpdateComplaintStatus();
  const addComment = useAddComment();

  const [selected, setSelected] = useState<any>(null);
  const [commentText, setCommentText] = useState("");

  const complaints: any[] = data?.complaints ?? [];
  const pagination = data?.pagination;

  const handleAddComment = () => {
    if (!commentText.trim() || !selected) return;
    addComment.mutate(
      { complaintID: selected.id, content: commentText },
      {
        onSuccess: () => {
          setCommentText("");
          setSelected(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Complaints</h1>
        <p className="text-muted-foreground">Platform-wide complaint management across all hostels.</p>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              View full details and reply to this complaint.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{selected.title}</h3>
                  <Badge variant={
                    selected.status === "RESOLVED" ? "default" :
                    selected.status === "IN_PROGRESS" ? "secondary" : "destructive"
                  }>
                    {selected.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span>By: <span className="font-medium text-foreground">{selected.user?.name}</span></span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {selected.hostel?.name}
                  </span>
                  <span>·</span>
                  <span>{new Date(selected.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Comments ({selected.comments?.length ?? 0})
                </p>
                {selected.comments?.length > 0 ? (
                  selected.comments.map((c: any) => (
                    <div key={c.id} className="bg-accent/50 rounded-md p-3 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{c.user?.name}</span>
                        <Badge variant="outline" className="text-xs py-0">{c.user?.role}</Badge>
                      </div>
                      <p>{c.content}</p>
                      <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-3">No comments yet.</p>
                )}
              </div>

              {/* Reply */}
              <div className="flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a reply..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                />
                <Button
                  disabled={!commentText.trim() || addComment.isPending}
                  onClick={handleAddComment}
                >
                  {addComment.isPending ? "..." : "Reply"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>
            {pagination?.total ?? 0} total complaints across all hostels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed rounded-lg flex flex-col items-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No complaints filed yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {c.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c.user?.name ?? "—"}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {c.hostel?.name ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        c.status === "RESOLVED" ? "default" :
                        c.status === "IN_PROGRESS" ? "secondary" : "destructive"
                      }>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(c)}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {c.comments?.length ?? 0}
                        </Button>
                        <Select
                          defaultValue={c.status}
                          onValueChange={(val) =>
                            updateStatus.mutate({ complaintID: c.id, status: val })
                          }
                          disabled={updateStatus.isPending || c.status === "RESOLVED"}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
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
      </Card>
    </div>
  );
}
