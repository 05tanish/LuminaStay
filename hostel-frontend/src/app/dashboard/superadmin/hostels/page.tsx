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
import { Building2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function HostelsManagement() {
  const { data: hostels, isLoading } = useHostels(1, 100);
  const createHostel = useCreateHostel();
  const deleteHostel = useDeleteHostel();
  
  const [isOpen, setIsOpen] = useState(false);
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
    if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      deleteHostel.mutate(id, {
        onSuccess: () => toast.success("Hostel deleted"),
        onError: () => toast.error("Failed to delete. Ensure hostel has no active data.")
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hostels</h1>
          <p className="text-muted-foreground">Manage all connected hostels in the system.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button className="gap-2" onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4" /> Add Hostel
            </Button>
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
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => handleDelete(hostel.id, hostel.name)}
                        disabled={deleteHostel.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
