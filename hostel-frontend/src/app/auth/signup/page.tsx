"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmailVerification } from "@/components/auth/EmailVerification";

// Phase 2 details setup (email is already verified and passed via state)
const signupDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  code: z.string().optional(),
});

type SignupDetailsValues = z.infer<typeof signupDetailsSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const form = useForm<SignupDetailsValues>({
    resolver: zodResolver(signupDetailsSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      code: "",
    },
  });

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: async (values: SignupDetailsValues) => {
      // ✅ Using unified registration endpoint but now lacking OTP since it's already verified in redis
      const response = await api.post("/auth/register", {
        name: values.name,
        email: verifiedEmail, // From step 1
        password: values.password,
        code: values.code || undefined, 
        phone: values.phone,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully!", {
        description: "You are being redirected.",
      });
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Signup failed", {
        description: error.response?.data?.message || "Ensure you have completed Email verification.",
      });
    },
  });

  function handleFinalSubmit(values: SignupDetailsValues) {
    register(values);
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader className="space-y-2 text-center text-primary">
        <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground">
          {step === 1 ? "Verify your email address to get started." : "Complete your profile profile to finish signing up."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <EmailVerification
            onVerified={(email) => {
              setVerifiedEmail(email);
              setStep(2);
            }}
          />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-left">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9998887776" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2 text-left opacity-60">
                 <FormLabel>Email (Verified)</FormLabel>
                 <Input disabled value={verifiedEmail} />
              </div>

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel>Workspace Invite Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave blank to create new workspace" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50" disabled={isRegistering}>
                {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Registration"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center text-sm">
        <div className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            Log in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
