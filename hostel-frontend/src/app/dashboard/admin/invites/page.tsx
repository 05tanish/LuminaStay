"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
import { useInvites, useCreateInvite } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, Plus, Copy, Check, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createInviteSchema = z.object({
  role: z.enum(["ADMIN", "STUDENT"]),
  type: z.enum(["EMAIL", "OPEN"]),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  hostelId: z.string().min(1, "Hostel ID is required"),
});

type InviteFormValues = z.infer<typeof createInviteSchema>;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

export default function AdminInvitesPage() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  const hostelId = user?.hostelId ?? "";
  const { data: invites, isLoading } = useInvites(hostelId);
  const { mutate: createInvite, isPending } = useCreateInvite();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: { role: "STUDENT", type: "OPEN", email: "", hostelId },
  });

  const watchType = form.watch("type");

  function onSubmit(values: InviteFormValues) {
    const payload: any = { role: values.role, type: values.type, hostelId: values.hostelId };
    if (values.type === "EMAIL" && values.email) payload.email = values.email;
    createInvite(payload, { onSuccess: () => { setOpen(false); form.reset({ ...form.getValues(), email: "" }); } });
  }

  const inviteList: any[] = Array.isArray(invites) ? invites : [];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invite System</h1>
          <p className="text-muted-foreground text-sm">
            Generate invite links or codes for new residents and admins.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" />}>
            <Plus className="h-4 w-4" />
            Create Invite
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Invite</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="STUDENT">Student / Resident</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="OPEN">Open (anyone with the link)</SelectItem>
                          <SelectItem value="EMAIL">Email-restricted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchType === "EMAIL" && (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Email</FormLabel>
                        <FormControl><Input placeholder="resident@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Invite
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invites list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : inviteList.map((invite) => {
              const inviteLink = `${baseUrl}/auth/signup?code=${invite.code}`;
              const isExpired = new Date(invite.expiresAt) < new Date() || invite.used;
              return (
                <div
                  key={invite.id}
                  className={`rounded-2xl border bg-card p-5 space-y-3 ${isExpired ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-indigo-500" />
                      <span className="font-mono text-sm font-bold">{invite.code}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={
                          isExpired
                            ? "bg-zinc-100 text-zinc-500"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950"
                        }
                      >
                        {invite.used ? "Used" : isExpired ? "Expired" : "Active"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{invite.role}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <p className="text-xs font-mono text-muted-foreground flex-1 truncate">{inviteLink}</p>
                    <CopyButton text={inviteLink} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {invite.type === "EMAIL" ? `📧 For: ${invite.email}` : "🌐 Open invite"} ·
                    Expires {format(new Date(invite.expiresAt), "MMM d, yyyy")}
                  </p>
                </div>
              );
            })}
        {!isLoading && inviteList.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <LinkIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No invites yet. Create one to onboard residents.</p>
          </div>
        )}
      </div>
    </div>
  );
}
