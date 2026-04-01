"use client";

import { useComplaints, useUpdateComplaintStatus } from "@/lib/api-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminComplaints() {
  const { data: complaintsData, isLoading } = useComplaints(1, 100);
  const updateStatus = useUpdateComplaintStatus();

  const handleStatusChange = (complaintID: string, status: string) => {
    updateStatus.mutate({ complaintID, status }, {
      onSuccess: () => toast.success("Status updated"),
      onError: () => toast.error("Failed to update status")
    });
  };

  const complaints = complaintsData?.complaints || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
        <p className="text-muted-foreground">Manage and resolve student issues.</p>
      </div>

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
                  <TableHead className="text-right">Update Status</TableHead>
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
                      <Select 
                        defaultValue={c.status} 
                        onValueChange={(val) => handleStatusChange(c.id, val)}
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="w-[140px] ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
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
