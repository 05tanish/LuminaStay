"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRooms, useCreateRoom, useAssignBed, useVacateBed } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, Plus, Bed, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const createRoomSchema = z.object({
  roomNo: z.string().min(1, "Room number is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  hostelId: z.string().min(1, "Hostel ID is required"),
});

type CreateRoomValues = z.infer<typeof createRoomSchema>;

export default function AdminRoomsPage() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const { data: rooms, isLoading } = useRooms(user?.hostelId);
  const { mutate: createRoom, isPending: creating } = useCreateRoom();

  const form = useForm<CreateRoomValues>({
    resolver: zodResolver(createRoomSchema) as any,
    defaultValues: { roomNo: "", capacity: 2, hostelId: user?.hostelId ?? "" },
  });

  function onSubmit(values: CreateRoomValues) {
    createRoom(values, {
      onSuccess: () => { setOpen(false); form.reset({ ...form.getValues(), roomNo: "" }); },
    });
  }

  const roomList: any[] = Array.isArray(rooms) ? rooms : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rooms & Beds</h1>
          <p className="text-muted-foreground text-sm">
            {roomList.length} rooms configured · Visual occupancy overview
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" />}>
            <Plus className="h-4 w-4" />
            Add Room
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="roomNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number / Name</FormLabel>
                      <FormControl>
                        <Input placeholder="101 or A-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bed Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={10} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Room
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Visual Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {roomList.map((room) => {
            const occupiedBeds = room.beds?.filter((b: any) => b.userId).length ?? 0;
            const totalBeds = room.beds?.length ?? room.capacity;
            const occupancyPct = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
            const isFull = occupiedBeds >= totalBeds;

            return (
              <div
                key={room.id}
                className="rounded-2xl border bg-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Room {room.roomNo}</span>
                  <Badge
                    variant="outline"
                    className={
                      isFull
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                    }
                  >
                    {isFull ? "Full" : "Available"}
                  </Badge>
                </div>

                {/* Bed occupancy visual */}
                <div className="flex flex-wrap gap-1.5">
                  {room.beds?.map((bed: any) => (
                    <div
                      key={bed.id}
                      title={bed.user ? `Bed ${bed.bedNo}: ${bed.user.name}` : `Bed ${bed.bedNo}: Empty`}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                        bed.userId
                          ? "bg-indigo-500 text-white"
                          : "bg-muted text-muted-foreground border"
                      }`}
                    >
                      {bed.bedNo}
                    </div>
                  ))}
                </div>

                {/* Occupancy bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{occupiedBeds} / {totalBeds} beds occupied</span>
                    <span>{Math.round(occupancyPct)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyPct === 100 ? "bg-rose-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Users className="h-3.5 w-3.5" />
                  {room.beds
                    ?.filter((b: any) => b.user)
                    .map((b: any) => b.user?.name)
                    .join(", ") || "No residents yet"}
                </div>
              </div>
            );
          })}

          {roomList.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground">
              <Bed className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No rooms created yet. Add your first room!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
