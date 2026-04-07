"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/auth-store";
import { useUpdateProfile } from "@/hooks/use-api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, User, Mail, Phone, Hash, Calendar, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "", phone: (user as any)?.phone || "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({ name: user.name || "", phone: (user as any).phone || "" });
    }
  }, [user, form]);

  const { mutate: deleteAccount, isPending: deleting } = useMutation({
    mutationFn: async () => {
      await api.delete("/user/me");
    },
    onSuccess: () => {
      toast.success("Account deleted");
      logout();
      router.push("/auth/login");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to delete account"),
  });

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600 h-8 w-8" />
      </div>
    );
  }

  function onSubmit(values: ProfileFormValues) {
    updateProfile(values);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your personal information and account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary Card */}
        <Card className="col-span-1 border-none shadow-sm bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-background">
          <CardHeader className="text-center pb-4">
            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-2 ring-4 ring-white dark:ring-background shadow-md">
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription className="flex justify-center gap-2 mt-2">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300">
                {user.role}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-zinc-400" />
              <span className="truncate">{user.email}</span>
            </div>
            {(user as any).phone && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-zinc-400" />
                <span>{(user as any).phone}</span>
              </div>
            )}
            {user.room?.roomNo && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Hash className="h-4 w-4 text-zinc-400" />
                <span>Room {user.room.roomNo}</span>
              </div>
            )}
            <div className="pt-4 border-t flex items-center gap-3 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 text-zinc-400" />
              <span>
                Joined{" "}
                {(user as any).createdAt
                  ? format(new Date((user as any).createdAt), "MMMM yyyy")
                  : "Unknown"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="col-span-1 md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-500" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your basic profile. Email cannot be changed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="pt-4 border-t flex justify-end">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-rose-200 dark:border-rose-900">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="gap-2" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Delete Account</DialogTitle>
            <DialogDescription>
              This permanently deletes your account, frees your bed, and removes all your data.
              Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Type DELETE to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setDeleteOpen(false); setConfirmText(""); }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={confirmText !== "DELETE" || deleting}
                onClick={() => deleteAccount()}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Forever
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
