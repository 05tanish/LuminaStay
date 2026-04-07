"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useAdmins, useReassignAdmin, useDeleteAdmin, useHostels } from "@/hooks/use-api";
import { Loader2, ShieldCheck, Mail, Calendar, MapPin, MoreHorizontal, ArrowRightLeft, UserX } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminsManagementPage() {
  const { data: admins, isLoading: adminsLoading } = useAdmins();
  const { data: hostels } = useHostels();
  const { mutate: reassignAdmin, isPending: reassigning } = useReassignAdmin();
  const { mutate: deleteAdmin, isPending: deleting } = useDeleteAdmin();

  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [selectedHostelId, setSelectedHostelId] = useState<string>("");

  const adminList = Array.isArray(admins) ? admins : [];
  const hostelList: any[] = hostels?.hostels ?? (Array.isArray(hostels) ? hostels : []);

  const handleReassignClick = (adminId: string, currentHostelId: string | null) => {
    setSelectedAdminId(adminId);
    setSelectedHostelId(currentHostelId ?? "");
    setReassignOpen(true);
  };

  const handleReassignSubmit = () => {
    if (!selectedAdminId || !selectedHostelId) return;
    
    reassignAdmin({ userId: selectedAdminId, hostelId: selectedHostelId }, {
      onSuccess: () => {
        setReassignOpen(false);
        setSelectedAdminId(null);
        setSelectedHostelId("");
      }
    });
  };

  const handleDelete = (adminId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from Admin role? They will be demoted to USER and lose access to all hostel management features.`)) {
      deleteAdmin(adminId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-muted-foreground text-sm">
            View all admins across the platform, reassign them to different hostels, or revoke their access.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {adminsLoading ? (
          <div className="p-8 space-y-4">
             {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Assigned Hostel</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No admins found. Invite users as Admin from the Invites page.
                  </TableCell>
                </TableRow>
              ) : (
                adminList.map((admin: any) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
                            {admin.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{admin.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {admin.hostel ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                            {admin.hostel.name}
                          </span>
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                            {admin.hostel.address}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(admin.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleReassignClick(admin.id, admin.hostelId)}>
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            Reassign Hostel
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-rose-600 dark:text-rose-400"
                            onClick={() => handleDelete(admin.id, admin.name)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Remove Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Admin</DialogTitle>
            <DialogDescription>
              Move this admin to a different property. They will lose access to their current hostel data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Property</label>
              <Select value={selectedHostelId} onValueChange={(val) => setSelectedHostelId(val ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a hostel" />
                </SelectTrigger>
                <SelectContent>
                  {hostelList.map((h: any) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
             <Button variant="outline" onClick={() => setReassignOpen(false)}>Cancel</Button>
             <Button 
                onClick={handleReassignSubmit} 
                disabled={reassigning || !selectedHostelId}
                className="bg-indigo-600 hover:bg-indigo-700"
             >
                {reassigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Reassignment
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
