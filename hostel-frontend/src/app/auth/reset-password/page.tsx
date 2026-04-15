"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
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
  FormDescription,
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

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  // Verify token on mount
  const { data: tokenData, isLoading: verifyingToken, error: tokenError } = useQuery({
    queryKey: ["verify-reset-token", token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");
      const response = await authApi.verifyResetToken(token);
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      if (!token) throw new Error("No token provided");
      const response = await authApi.resetPassword({
        token,
        newPassword: values.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      setResetSuccess(true);
      toast.success("Password reset successful!", {
        description: "You can now login with your new password.",
      });
    },
    onError: (error: any) => {
      toast.error("Reset failed", {
        description:
          error.response?.data?.message ||
          "Invalid or expired token. Please request a new reset link.",
      });
    },
  });

  function onSubmit(data: ResetPasswordValues) {
    mutate(data);
  }

  // No token in URL
  if (!token) {
    return (
      <Card className="shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Invalid reset link
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            This password reset link is invalid or incomplete.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/auth/forgot-password" className="w-full">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              Request a new reset link
            </Button>
          </Link>
          <Link href="/auth/login" className="w-full">
            <Button variant="ghost" className="w-full">
              Back to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Token verification in progress
  if (verifyingToken) {
    return (
      <Card className="shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-muted-foreground">Verifying reset link...</p>
        </CardContent>
      </Card>
    );
  }

  // Token is invalid or expired
  if (tokenError) {
    return (
      <Card className="shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Link expired
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            This password reset link has expired or is invalid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">Reset links expire after 1 hour for security.</p>
            <p className="mt-1">Please request a new password reset link.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/auth/forgot-password" className="w-full">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              Request a new reset link
            </Button>
          </Link>
          <Link href="/auth/login" className="w-full">
            <Button variant="ghost" className="w-full">
              Back to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Password reset successful
  if (resetSuccess) {
    return (
      <Card className="shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Password reset successful!
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your password has been changed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p className="font-medium">✓ Your password is now updated</p>
            <p className="mt-1">You can now login with your new password.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/auth/login" className="w-full">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              Continue to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Show reset password form
  return (
    <Card className="shadow-2xl">
      <CardHeader className="space-y-2 text-center text-primary">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create new password
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter a strong password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Must be at least 8 characters long
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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
              Reset password
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-center text-sm">
        <Link href="/auth/login" className="w-full">
          <Button variant="ghost" className="w-full">
            Back to login
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
