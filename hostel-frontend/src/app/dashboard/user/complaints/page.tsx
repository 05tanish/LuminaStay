"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useComplaints, useCreateComplaint, useDeleteComplaint } from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { Loader2, Plus, Trash2, MessageSquareWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Please provide more details (min 10 characters)"),
});

type ComplaintValues = z.infer<typeof complaintSchema>;

export default function UserComplaintsPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useComplaints(page);
  const { mutate: createComplaint, isPending: creating } = useCreateComplaint();
  const { mutate: deleteComplaint } = useDeleteComplaint();

  const complaints: any[] = data?.complaints ?? data?.data ?? [];
  const total: number = data?.pagination?.total ?? data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const form = useForm<ComplaintValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { title: "", description: "" },
  });

  function onSubmit(values: ComplaintValues) {
    createComplaint(values, {
      onSuccess: () => { setOpen(false); form.reset(); },
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Complaints</h1>
          <p className="text-muted-foreground text-sm">Track status of your issues below.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" />}>
            <Plus className="h-4 w-4" />
            New Complaint
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquareWarning className="h-5 w-5 text-rose-500" />
                Submit a Complaint
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bathroom tap leaking" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe the issue</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide as much detail as possible..."
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
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                  disabled={creating}
                >
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Complaint
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Complaints list */}
      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : complaints.map((c) => (
              <div key={c.id} className="rounded-2xl border bg-card p-5 flex gap-4">
                <div className="pt-0.5">
                  <div className="p-2 rounded-xl bg-muted">
                    <MessageSquareWarning className="h-4 w-4 text-rose-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{c.title}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.description}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Submitted {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                {c.status === "OPEN" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-rose-500 hover:bg-rose-50 self-start shrink-0"
                    onClick={() => deleteComplaint(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
        {!isLoading && complaints.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <MessageSquareWarning className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No complaints yet. Great living conditions! 🎉</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
