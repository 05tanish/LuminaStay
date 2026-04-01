"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBroadcastNotification } from "@/hooks/use-api";
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

const broadcastSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

type BroadcastValues = z.infer<typeof broadcastSchema>;

export default function AdminNotificationsPage() {
  const { mutate: broadcast, isPending } = useBroadcastNotification();
  const [sent, setSent] = useState<{ title: string; message: string; at: string }[]>([]);

  const form = useForm<BroadcastValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { title: "", message: "" },
  });

  function onSubmit(values: BroadcastValues) {
    broadcast(values, {
      onSuccess: () => {
        setSent((prev) => [
          { ...values, at: new Date().toLocaleTimeString() },
          ...prev,
        ]);
        form.reset();
      },
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm">
          Broadcast messages to all hostel residents instantly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-indigo-500" />
            Broadcast Notification
          </CardTitle>
          <CardDescription>
            This message will be sent to <strong>all residents</strong> in your hostel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Important: Water supply disruption tomorrow"
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
                        placeholder="Write your full message here..."
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
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Broadcast to All Residents
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Sent history (local state only, no API endpoint for history) */}
      {sent.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Sent This Session
          </h2>
          {sent.map((n, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 flex gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 self-start">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <span className="text-xs text-muted-foreground">{n.at}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
