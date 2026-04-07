"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBroadcastNotification, useHostels } from "@/hooks/use-api";
import { Bell, Radio, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const broadcastSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  hostelId: z.string().min(1, "Target is required"),
});

type BroadcastValues = z.infer<typeof broadcastSchema>;

export default function SuperAdminNotificationsPage() {
  const { data: hostels, isLoading: hostelsLoading } = useHostels();
  const { mutate: broadcast, isPending } = useBroadcastNotification();
  const [sent, setSent] = useState<{ title: string; message: string; target: string; at: string }[]>([]);

  const form = useForm<BroadcastValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { title: "", message: "", hostelId: "all" },
  });

  const hostelList: any[] = hostels?.hostels ?? (Array.isArray(hostels) ? hostels : []);

  function onSubmit(values: BroadcastValues) {
    const payload: any = { title: values.title, message: values.message };
    if (values.hostelId !== "all") {
      payload.hostelId = values.hostelId;
    }

    broadcast(payload, {
      onSuccess: () => {
        const targetName = values.hostelId === "all" 
          ? "Global (All users)" 
          : hostelList.find(h => h.id === values.hostelId)?.name || "Specific Hostel";
          
        setSent((prev) => [
          { title: values.title, message: values.message, target: targetName, at: new Date().toLocaleTimeString() },
          ...prev,
        ]);
        form.reset();
      },
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Global Notifications</h1>
        <p className="text-muted-foreground text-sm">
          Broadcast messages to all users or target specific hostels.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-indigo-500" />
            Global Broadcast System
          </CardTitle>
          <CardDescription>
            Messages sent from here appear in the user dashboard instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="hostelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val ?? "all")} value={field.value} disabled={hostelsLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">🌐 All Users (Global Broadcast)</SelectItem>
                        {hostelList.map((h: any) => (
                          <SelectItem key={h.id} value={h.id}>
                            🏠 {h.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Scheduled System Maintenance"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your full update here..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Broadcast
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Sent history */}
      {sent.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Broadcasts Sent This Session
          </h2>
          {sent.map((n, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 flex gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 self-start">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                  <p className="font-semibold text-sm truncate">{n.title}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{n.at}</span>
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium my-1">
                  Target: {n.target}
                </div>
                <p className="text-sm text-muted-foreground mt-1 break-words">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
