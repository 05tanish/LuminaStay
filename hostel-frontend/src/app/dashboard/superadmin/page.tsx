"use client";

import { useAuthStore } from "@/store/auth-store";
import { useHostels, useCreateHostel, useAssignAdmin } from "@/hooks/use-api";
import { StatCard } from "@/components/stat-card";
import { Hotel, Users, Globe, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const hostelSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type HostelValues = z.infer<typeof hostelSchema>;

const assignAdminSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  hostelId: z.string().min(1, "Hostel ID is required"),
});

type AssignAdminValues = z.infer<typeof assignAdminSchema>;

export default function SuperAdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: hostels, isLoading } = useHostels();
  const { mutate: createHostel, isPending: creating } = useCreateHostel();
  const { mutate: assignAdmin, isPending: assigning } = useAssignAdmin();
  const [hostelOpen, setHostelOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const hostelList: any[] = Array.isArray(hostels) ? hostels : [];

  useEffect(() => {
    if (!isLoading && hostelList.length === 0) {
      setHostelOpen(true);
    }
  }, [isLoading, hostelList.length]);

  const hostelForm = useForm<HostelValues>({
    resolver: zodResolver(hostelSchema),
    defaultValues: { name: "", address: "" },
  });

  const assignForm = useForm<AssignAdminValues>({
    resolver: zodResolver(assignAdminSchema),
    defaultValues: { userId: "", hostelId: "" },
  });

  function onCreateHostel(values: HostelValues) {
    createHostel(values, { onSuccess: () => { setHostelOpen(false); hostelForm.reset(); } });
  }

  function onAssignAdmin(values: AssignAdminValues) {
    assignAdmin(values, { onSuccess: () => { setAssignOpen(false); assignForm.reset(); } });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          System-wide overview — Welcome, <span className="font-medium text-foreground">{user?.name}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Hostels"
          value={hostelList.length}
          description="Across the platform"
          icon={<Hotel className="h-4 w-4 text-indigo-500" />}
          loading={isLoading}
        />
        <StatCard
          title="Total Rooms"
          value={hostelList.reduce((acc: number, h: any) => acc + (h._count?.rooms ?? h.rooms?.length ?? 0), 0)}
          description="All hostels combined"
          icon={<Globe className="h-4 w-4 text-emerald-500" />}
          loading={isLoading}
        />
        <StatCard
          title="Total Users"
          value={hostelList.reduce((acc: number, h: any) => acc + (h._count?.users ?? h.users?.length ?? 0), 0)}
          description="All hostel residents"
          icon={<Users className="h-4 w-4 text-amber-500" />}
          loading={isLoading}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Dialog open={hostelOpen} onOpenChange={setHostelOpen}>
          <DialogTrigger>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={() => setHostelOpen(true)}>
              <Plus className="h-4 w-4" /> Create Hostel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Hostel</DialogTitle></DialogHeader>
            <Form {...hostelForm}>
              <form onSubmit={hostelForm.handleSubmit(onCreateHostel)} className="space-y-4 pt-2">
                <FormField control={hostelForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Hostel Name</FormLabel><FormControl><Input placeholder="Green Valley Boys Hostel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={hostelForm.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Full Address</FormLabel><FormControl><Input placeholder="123 Main Street, City" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Hostel
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogTrigger>
            <Button variant="outline" className="gap-2" onClick={() => setAssignOpen(true)}>
              <Users className="h-4 w-4" /> Assign Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Assign Admin to Hostel</DialogTitle></DialogHeader>
            <Form {...assignForm}>
              <form onSubmit={assignForm.handleSubmit(onAssignAdmin)} className="space-y-4 pt-2">
                <FormField control={assignForm.control} name="userId" render={({ field }) => (
                  <FormItem><FormLabel>User ID</FormLabel><FormControl><Input placeholder="Paste User ID" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={assignForm.control} name="hostelId" render={({ field }) => (
                  <FormItem><FormLabel>Hostel ID</FormLabel><FormControl><Input placeholder="Paste Hostel ID" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={assigning}>
                  {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Assign Admin
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hostels Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Hostels</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hostelList.map((hostel) => (
              <div key={hostel.id} className="rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <Hotel className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">{hostel.id.slice(0, 8)}…</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{hostel.name}</h3>
                  <p className="text-sm text-muted-foreground">{hostel.address}</p>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{hostel._count?.rooms ?? hostel.rooms?.length ?? 0} rooms</span>
                  <span>{hostel._count?.users ?? hostel.users?.length ?? 0} residents</span>
                </div>
              </div>
            ))}
            {hostelList.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                <Hotel className="h-10 w-10 mx-auto mb-3 opacity-30" />
                No hostels created yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
