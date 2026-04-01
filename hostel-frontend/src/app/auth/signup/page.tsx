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

// Frontend schema mapped to include Invite requirements and proposed OTP/Phone fields
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  code: z.string().optional(),
  otp: z.string().min(6, "OTP must be 6 digits").optional(),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      code: "",
      otp: "",
    },
  });

  const { mutate: requestOtp, isPending: isOtpLoading } = useMutation({
    mutationFn: async (phone: string) => {
      // ✅ Using backend OTP endpoint: /api/auth/otp/send
      const response = await api.post("/auth/otp/send", { phone });
      return response.data;
    },
    onSuccess: () => {
      toast.success("OTP Sent!", { description: "Please check your phone." });
      setStep("otp");
      startCooldown();
    },
    onError: (error: any) => {
      toast.error("Failed to send OTP", {
        description: error.response?.data?.message || "Please try again later.",
      });
    },
  });

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: async (values: SignupValues) => {
      // ✅ Using unified registration endpoint
      const response = await api.post("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password,
        code: values.code || undefined, // don't send empty string
        phone: values.phone,
        otp: values.otp,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully!", {
        description: "You are being redirected.",
      });
      // Unified login redirects straight to dashboard root to route based on roles
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Signup failed", {
        description: error.response?.data?.message || "Verify your details or invite code.",
      });
    },
  });

  function startCooldown() {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleRegisterAttempt(values: SignupValues) {
    if (step === "details") {
      // Send OTP first
      requestOtp(values.phone);
    } else {
      // Final register call
      register(values);
    }
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader className="space-y-2 text-center text-primary">
        <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground">
          {step === "details" ? "Enter your details. Leave invite code blank to create a new generic admin workspace." : "Verify your phone number."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRegisterAttempt)} className="space-y-4">
            {step === "details" && (
              <>
                <div className="grid grid-cols-2 gap-4">
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
               
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invite Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your invite code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === "otp" && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter 6-digit OTP</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" maxLength={6} {...field} />
                    </FormControl>
                    <FormMessage />
                    <div className="flex justify-between items-center mt-2">
                       <button
                         type="button"
                         className="text-sm text-indigo-500 hover:text-indigo-600 disabled:text-muted-foreground transition-colors"
                         disabled={cooldown > 0 || isOtpLoading}
                         onClick={() => requestOtp(form.getValues().phone)}
                       >
                         {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                       </button>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50" disabled={isOtpLoading || isRegistering}>
              {step === "details" ? (isOtpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue") : (isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Register")}
            </Button>
            
            {step === "otp" && (
               <Button type="button" variant={"ghost"} className="w-full mt-2" onClick={() => setStep("details")}>
                  Go Back
               </Button>
            )}
          </form>
        </Form>
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
