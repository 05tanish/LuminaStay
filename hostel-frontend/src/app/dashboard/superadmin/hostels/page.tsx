"use client";

import { useState } from "react";
import { useHostels, useCreateHostel, useDeleteHostel, Hostel } from "@/lib/api-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Plus, Trash2, ArrowRightLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

export default function HostelsManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: result, isLoading } = useHostels(page, 10, search);
  const hostels = result?.hostels || [];
  const pagination = result?.pagination;
  const router = useRouter();
  const queryClient = useQueryClient();

  const createHostel = useCreateHostel();
  const deleteHostel = useDeleteHostel();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferHostelId, setTransferHostelId] = useState("");
  const [targetHostelId, setTargetHostelId] = useState("");
  const [formData, setFormData] = useState({ name: "", address: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createHostel.mutate(formData, {
      onSuccess: () => {
        toast.success("Hostel created successfully");
        setIsOpen(false);
        setFormData({ name: "", address: "" });
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to create hostel");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will soft delete it if no users are active.`)) {
      deleteHostel.mutate(id, {
        onSuccess: () => toast.success("Hostel deleted"),
        onError: () => toast.error("Failed to delete. Try transferring users first.")
      });
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/hostel/${transferHostelId}/transfer`, { targetHostelId });
      toast.success("Hostel transferred successfully");
      setIsTransferOpen(false);
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to transfer hostel");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hostels</h1>
          <p className="text-muted-foreground">Manage all connected hostels in the system.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search hostels..."
              className="pl-8 w-[250px]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="w-4 h-4" /> Add Hostel
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Hostel</DialogTitle>
              <DialogDescription>
                Add a new property to the management system. Admins can be assigned later.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hostel Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Sunrise Boys Hostel" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input 
                  id="address" 
                  placeholder="e.g. 123 Main St, Springfield" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createHostel.isPending}>
                  {createHostel.isPending ? "Creating..." : "Save Hostel"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Transfer Dialog */}
        <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Hostel Data</DialogTitle>
              <DialogDescription>
                Transfer all users, complaints, and valid rooms to another hostel, then soft-delete this hostel.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetHostel">Select Target Hostel</Label>
                <select
                  id="targetHostel"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={targetHostelId}
                  onChange={(e) => setTargetHostelId(e.target.value)}
                  required
                >
                  <option value="">-- Select a hostel --</option>
                  {hostels
                    .filter((h: Hostel) => h.id !== transferHostelId)
                    .map((h: Hostel) => (
                      <option key={h.id} value={h.id}>
                        {h.name} - {h.address}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Choose the destination hostel for all data transfer
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTransferOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!targetHostelId}>
                  Complete Transfer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Hostels</CardTitle>
          <CardDescription>A complete list of registered properties</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">Loading hostels...</div>
          ) : !hostels || hostels.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-3 border-2 border-dashed rounded-lg">
              <Building2 className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground">No hostels found. Add one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hostel Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hostels.map((hostel: Hostel) => (
                  <TableRow key={hostel.id}>
                    <TableCell className="font-medium">{hostel.name}</TableCell>
                    <TableCell>{hostel.address}</TableCell>
                    <TableCell>{new Date(hostel.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/superadmin/hostels/${hostel.id}`)}
                        >
                          View Stats
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon"
                          onClick={() => {
                            setTransferHostelId(hostel.id);
                            setIsTransferOpen(true);
                          }}
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDelete(hostel.id, hostel.name)}
                          disabled={deleteHostel.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === pagination.totalPages} 
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
