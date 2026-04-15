"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/lib/api";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      const response = await authApi.requestPasswordReset(values.email);
      return response.data;
    },
    onSuccess: (data, variables) => {
      setEmailSent(true);
      setSubmittedEmail(variables.email);
      toast.success("Email sent!", {
        description: "Check your inbox for password reset instructions.",
      });
    },
    onError: (error: any) => {
      toast.error("Request failed", {
        description: error.response?.data?.message || "Please try again later.",
      });
    },
  });

  function onSubmit(data: ForgotPasswordValues) {
    mutate(data);
  }

  if (emailSent) {
    return (
      <Card className="shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            We&apos;ve sent password reset instructions to
          </CardDescription>
          <p className="font-medium text-primary">{submittedEmail}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="mb-2 font-medium">📧 What to do next:</p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the password reset link</li>
              <li>Create a new password</li>
            </ol>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            The link will expire in 1 hour for security reasons.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setEmailSent(false);
              form.reset();
            }}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send to a different email
          </Button>
          <Link href="/auth/login" className="w-full">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader className="space-y-2 text-center text-primary">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Forgot your password?
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          No worries! Enter your email and we&apos;ll send you reset instructions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-center text-sm">
        <Link href="/auth/login" className="w-full">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
