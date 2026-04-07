"use client";

import { useAdminComplaints, useUpdateComplaintStatus, useAddComplaintComment } from "@/lib/api-hooks";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminComplaints() {
  const { data: complaintsData, isLoading } = useAdminComplaints(1, 100);
  const updateStatus = useUpdateComplaintStatus();
  const addComment = useAddComplaintComment();

  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [commentText, setCommentText] = useState("");

  const handleStatusChange = (complaintID: string, status: string) => {
    updateStatus.mutate({ complaintID, status }, {
      onSuccess: () => toast.success("Status updated"),
      onError: () => toast.error("Failed to update status")
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedComplaint) return;
    addComment.mutate({ complaintID: selectedComplaint.id, content: commentText }, {
      onSuccess: () => {
        toast.success("Comment added");
        setCommentText("");
        // We could also re-fetch individual complaint but react-query invalidation works
        setSelectedComplaint(null); // Close dialog
      },
      onError: () => toast.error("Failed to add comment")
    });
  };

  const complaints = complaintsData?.complaints ?? complaintsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
        <p className="text-muted-foreground">Manage and resolve student issues.</p>
      </div>

      <Dialog open={!!selectedComplaint} onOpenChange={(v) => !v && setSelectedComplaint(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complaint Comments</DialogTitle>
            <DialogDescription>
              View history and add new replies to this complaint.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {selectedComplaint?.comments && selectedComplaint.comments.length > 0 ? (
                selectedComplaint.comments.map((c: any) => (
                  <div key={c.id} className="flex flex-col gap-1 text-sm bg-accent/50 p-3 rounded-md">
                    <span className="font-semibold text-primary">{c.user?.name} <span className="text-muted-foreground font-normal text-xs ml-1">({c.user?.role})</span></span>
                    <span>{c.content}</span>
                    <span className="text-xs text-muted-foreground mt-1">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">No comments yet.</div>
              )}
            </div>
            <div className="flex gap-2">
              <Input 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)} 
                placeholder="Type a comment..." 
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button disabled={!commentText.trim() || addComment.isPending} onClick={handleAddComment}>
                {addComment.isPending ? "..." : "Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Recent Complaints</CardTitle>
          <CardDescription>Review and track the progress of logged issues.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">Loading complaints...</div>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-sm text-muted-foreground max-w-[240px] truncate">{c.description}</div>
                    </TableCell>
                    <TableCell>{c.user?.name || "Unknown"}</TableCell>
                    <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
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
                        <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(c)}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {c.comments?.length || 0} Replies
                        </Button>
                        <Select 
                          defaultValue={c.status} 
                          onValueChange={(val) => handleStatusChange(c.id, val)}
                          disabled={updateStatus.isPending}
                        >
                          <SelectTrigger className="w-[140px]">
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
      </Card>
    </div>
  );
}
