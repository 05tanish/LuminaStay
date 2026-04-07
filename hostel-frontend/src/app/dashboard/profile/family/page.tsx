"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/auth-store";
import { useRequestProfileUpdate } from "@/hooks/use-api";
import { Loader2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const familySchema = z.object({
  fatherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  fatherProfession: z.string().optional(),
  motherName: z.string().optional(),
  motherPhone: z.string().optional(),
  motherProfession: z.string().optional(),
  parentAddress: z.string().optional(),
  permanentPhone: z.string().optional(),
  reason: z.string().min(5, "Reason must be at least 5 characters to request approval"),
});

type FamilyFormValues = z.infer<typeof familySchema>;

export default function FamilyDetailsPage() {
  const { user } = useAuthStore();
  const { mutate: requestUpdate, isPending } = useRequestProfileUpdate();

  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      fatherName: (user as any)?.userDetails?.fatherName || "",
      fatherPhone: (user as any)?.userDetails?.fatherPhone || "",
      fatherProfession: (user as any)?.userDetails?.fatherProfession || "",
      motherName: (user as any)?.userDetails?.motherName || "",
      motherPhone: (user as any)?.userDetails?.motherPhone || "",
      motherProfession: (user as any)?.userDetails?.motherProfession || "",
      parentAddress: (user as any)?.userDetails?.parentAddress || "",
      permanentPhone: (user as any)?.userDetails?.permanentPhone || "",
      reason: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fatherName: (user as any).userDetails?.fatherName || "",
        fatherPhone: (user as any).userDetails?.fatherPhone || "",
        fatherProfession: (user as any).userDetails?.fatherProfession || "",
        motherName: (user as any).userDetails?.motherName || "",
        motherPhone: (user as any).userDetails?.motherPhone || "",
        motherProfession: (user as any).userDetails?.motherProfession || "",
        parentAddress: (user as any).userDetails?.parentAddress || "",
        permanentPhone: (user as any).userDetails?.permanentPhone || "",
        reason: "",
      });
    }
  }, [user, form]);

  if (!user) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 h-8 w-8" /></div>;
  }

  function onSubmit(values: FamilyFormValues) {
    const { reason, ...changes } = values;
    requestUpdate({ changes, reason }, {
        onSuccess: () => {
            form.reset({ ...values, reason: "" });
        }
    });
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Family Details</h1>
        <p className="text-muted-foreground text-sm">
          Information regarding parents / guardians. 
          {!isAdmin && <span className="font-semibold text-rose-500 ml-1">Requires approval for changes.</span>}
        </p>
      </div>

      <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Parental Information
            </CardTitle>
            <CardDescription>
              {isAdmin 
                ? "As an admin, it's not compulsory to fill these out, but highly recommended for emergency contact."
                : "Submit an approval request to the administration to update your familial information."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="permanentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permanent Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Father's Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fatherPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fatherProfession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Profession</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Engineer, Business" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Mother's Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="motherPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motherProfession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Profession</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Teacher, Homemaker" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Permanent Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Example Street, City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2 mt-4">
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Update Update (Required)</FormLabel>
                          <CardDescription className="mb-2">Admins will review this context before approving</CardDescription>
                          <FormControl>
                            <Textarea placeholder="E.g., Changed my permanent address last week..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit for Approval
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
  );
}
