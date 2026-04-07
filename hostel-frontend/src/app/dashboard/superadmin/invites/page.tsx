"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { 
  useInvites, 
  useCreateInvite, 
  useHostels, 
  useSendEmailShare,
  useAllInvites,
  useDeleteInvite 
} from "@/hooks/use-api";
import { Loader2, Plus, Copy, Check, Link as LinkIcon, Building, MessageCircle, Mail, Trash2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";

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

function EmailShareButton({ invite, inviteLink }: { invite: any; inviteLink: string }) {
  const { mutate, isPending } = useSendEmailShare();
  if (invite.type !== "EMAIL") return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      disabled={isPending || invite.used || new Date(invite.expiresAt) < new Date()}
      onClick={() => mutate({ code: invite.code, email: invite.email, originUrl: window.location.origin })}
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5 text-indigo-500" />}
    </Button>
  );
}

function WhatsAppShareButton({ inviteLink }: { inviteLink: string }) {
  const handleShare = () => {
    const text = encodeURIComponent(`Join Hostel using this link: ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
      <MessageCircle className="h-3.5 w-3.5 text-green-500" />
    </Button>
  );
}

export default function SuperAdminInvitesPage() {
  const [open, setOpen] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState<string>("all");

  const { data: hostels, isLoading: hostelsLoading } = useHostels();
  const hostelList: any[] = hostels?.hostels ?? (Array.isArray(hostels) ? hostels : []);

  const { data: hostelInvites, isLoading: invitesLoading } = useInvites(selectedHostelId === "all" ? undefined : selectedHostelId);
  const { data: globalInvites, isLoading: globalLoading } = useAllInvites();
  
  const invites = selectedHostelId === "all" ? globalInvites : hostelInvites;
  const isLoading = selectedHostelId === "all" ? globalLoading : invitesLoading;

  const { mutate: createInvite, isPending } = useCreateInvite();
  const { mutate: deleteInvite, isPending: isDeleting } = useDeleteInvite();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: { role: "ADMIN", type: "OPEN", email: "", hostelId: "" },
  });

  // Keep form's hostelId in sync with selectedHostelId
  useEffect(() => {
    if (selectedHostelId && selectedHostelId !== "all") {
      form.setValue("hostelId", selectedHostelId);
    }
  }, [selectedHostelId, form]);

  const watchType = form.watch("type");

  function onSubmit(values: InviteFormValues) {
    const payload: any = { role: values.role, type: values.type, hostelId: values.hostelId };
    if (values.type === "EMAIL" && values.email) payload.email = values.email;
    createInvite(payload, { 
      onSuccess: () => { 
        setOpen(false); 
        form.reset({ ...form.getValues(), email: "" }); 
      } 
    });
  }

  const inviteList: any[] = Array.isArray(invites) ? invites : [];
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global Invite System</h1>
          <p className="text-muted-foreground text-sm">
            Generate invite links for any hostel. Mostly used for onboarding Admins.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Select value={selectedHostelId} onValueChange={(val) => setSelectedHostelId(val ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Select hostel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌐 All Hostels</SelectItem>
                {hostelList.map((h: any) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                    name="hostelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Hostel</FormLabel>
                        <Select onValueChange={(val) => field.onChange(val ?? "")} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {hostelList.map((h: any) => (
                              <SelectItem key={h.id} value={h.id}>
                                {h.name}
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
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Role</FormLabel>
                        <Select onValueChange={(val) => field.onChange(val ?? "")} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="STUDENT">Student / Resident</SelectItem>
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
                        <Select onValueChange={(val) => field.onChange(val ?? "")} value={field.value}>
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
                          <FormControl><Input placeholder="admin@example.com" {...field} /></FormControl>
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
      </div>

      {/* Invites list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hostelsLoading || isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : inviteList.map((invite) => {
              const inviteLink = `${baseUrl}/auth/register?code=${invite.code}`;
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Invite"
                        onClick={() => deleteInvite(invite.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <p className="text-xs font-mono text-muted-foreground flex-1 truncate">{inviteLink}</p>
                    <div className="flex items-center">
                      <WhatsAppShareButton inviteLink={inviteLink} />
                      <EmailShareButton invite={invite} inviteLink={inviteLink} />
                      <CopyButton text={inviteLink} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {invite.type === "EMAIL" ? `📧 For: ${invite.email}` : "🌐 Open invite"} ·
                    Expires {format(new Date(invite.expiresAt), "MMM d, yyyy")}
                    {selectedHostelId === "all" && invite.hostel ? ` · 🏠 ${invite.hostel.name}` : ""}
                  </p>
                </div>
              );
            })}
        {(!hostelsLoading && !isLoading) && inviteList.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            {selectedHostelId && selectedHostelId !== "all" ? (
              <>
                <LinkIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No invites created for this hostel yet.</p>
              </>
            ) : (
              <>
                <Building className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Select a hostel or create one first to generate invites.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
