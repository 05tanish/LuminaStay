"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-store";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailVerification } from "@/components/auth/EmailVerification";

// ─── Schemas ─────────────────────────────────────────────────────────────────

// Standard email registration (after OTP verification)
const emailRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  code: z.string().optional(),
});

// Google registration — no password, no OTP, just invite code + name + phone
const googleRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number required"),
  code: z.string().optional(),
});

type EmailRegisterValues = z.infer<typeof emailRegisterSchema>;
type GoogleRegisterValues = z.infer<typeof googleRegisterSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function redirectByRole(role: string, router: ReturnType<typeof useRouter>) {
  if (role === "SUPER_ADMIN") router.push("/dashboard/superadmin");
  else if (role === "ADMIN") router.push("/dashboard/admin");
  else router.push("/dashboard/user");
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const urlCode = searchParams.get("code") || "";

  // "email-otp" = standard flow, "google-register" = Google flow
  const [mode, setMode] = useState<"choose" | "email-otp" | "email-details" | "google-register">("choose");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  // Google state — stored after Google token received but no account found
  const [googleToken, setGoogleToken] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Load Google Identity Services script once
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // ── Email registration form ──
  const emailForm = useForm<EmailRegisterValues>({
    resolver: zodResolver(emailRegisterSchema),
    defaultValues: { name: "", phone: "", password: "", code: urlCode },
  });

  const { mutate: emailRegister, isPending: emailRegistering } = useMutation({
    mutationFn: async (values: EmailRegisterValues) => {
      const res = await api.post("/auth/register", {
        name: values.name,
        email: verifiedEmail,
        password: values.password,
        code: values.code || undefined,
        phone: values.phone,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Account created!");
      setAuth(data.data);
      redirectByRole(data.data.role, router);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Registration failed"),
  });

  // ── Google registration form ──
  const googleForm = useForm<GoogleRegisterValues>({
    resolver: zodResolver(googleRegisterSchema),
    defaultValues: { name: googleName, phone: "", code: urlCode },
  });

  // Sync Google name into form when it arrives
  useEffect(() => {
    if (googleName) googleForm.setValue("name", googleName);
    if (urlCode) googleForm.setValue("code", urlCode);
  }, [googleName, urlCode, googleForm]);

  const { mutate: googleRegister, isPending: googleRegistering } = useMutation({
    mutationFn: async (values: GoogleRegisterValues) => {
      const res = await api.post("/auth/google-register", {
        token: googleToken,
        name: values.name,
        phone: values.phone,
        code: values.code || undefined,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Account created with Google!");
      setAuth(data.data);
      redirectByRole(data.data.role, router);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Google registration failed"),
  });

  // ── Trigger Google prompt ──
  const triggerGooglePrompt = (onToken: (token: string, email: string, name: string) => void) => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) { toast.error("Google login not configured"); return; }

    setGoogleLoading(true);
    const g = (window as any).google;
    if (!g) {
      toast.error("Google script not loaded yet. Please wait a moment and try again.");
      setGoogleLoading(false);
      return;
    }

    g.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        try {
          // Try login first
          const res = await api.post("/auth/google", { token: response.credential });
          setAuth(res.data.data);
          toast.success("Logged in with Google!");
          redirectByRole(res.data.data.role, router);
        } catch (e: any) {
          if (e.response?.status === 404 && e.response.data?.code === "GOOGLE_USER_NOT_FOUND") {
            // No account — pass token + info to registration form
            onToken(
              response.credential,
              e.response.data.email || "",
              e.response.data.name || ""
            );
          } else {
            toast.error(e.response?.data?.message || "Google error. Please try again.");
          }
        } finally {
          setGoogleLoading(false);
        }
      },
      // Cancel loading if user closes the prompt
      error_callback: () => setGoogleLoading(false),
    });

    // Use renderButton as fallback if prompt is blocked (e.g. third-party cookie restrictions)
    g.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleLoading(false);
        toast.error("Google sign-in popup was blocked.", {
          description: "Please allow popups for this site, or use email registration.",
        });
      }
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const title = {
    choose: "Create an account",
    "email-otp": "Verify your email",
    "email-details": "Complete your profile",
    "google-register": "Almost there!",
  }[mode];

  const subtitle = {
    choose: "Choose how you'd like to register.",
    "email-otp": "Enter your email to receive a verification code.",
    "email-details": "Fill in your details to finish signing up.",
    "google-register": "Google verified your email. Just add your details.",
  }[mode];

  return (
    <Card className="shadow-2xl">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* ── CHOOSE MODE ── */}
        {mode === "choose" && (
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => triggerGooglePrompt((token, email, name) => {
                setGoogleToken(token);
                setGoogleEmail(email);
                setGoogleName(name);
                setMode("google-register");
              })}
              disabled={googleLoading}
            >
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setMode("email-otp")}
            >
              Register with Email
            </Button>
          </div>
        )}

        {/* ── EMAIL OTP STEP ── */}
        {mode === "email-otp" && (
          <>
            <EmailVerification
              onVerified={(email) => {
                setVerifiedEmail(email);
                setMode("email-details");
              }}
            />
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setMode("choose")}>
              ← Back
            </Button>
          </>
        )}

        {/* ── EMAIL DETAILS STEP ── */}
        {mode === "email-details" && (
          <>
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Email verified: <span className="font-medium">{verifiedEmail}</span>
            </div>

            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit((v) => emailRegister(v))} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={emailForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={emailForm.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input placeholder="9998887776" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={emailForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={emailForm.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invite Code <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="Leave blank if first Super Admin" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={emailRegistering}>
                  {emailRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </Form>
          </>
        )}

        {/* ── GOOGLE REGISTER STEP ── */}
        {mode === "google-register" && (
          <>
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Google verified: <span className="font-medium">{googleEmail}</span>
            </div>

            <Form {...googleForm}>
              <form onSubmit={googleForm.handleSubmit((v) => googleRegister(v))} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={googleForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={googleForm.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input placeholder="9998887776" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={googleForm.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invite Code <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="Leave blank if first Super Admin" {...field} /></FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Required if you were invited by an admin.
                    </p>
                  </FormItem>
                )} />

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={googleRegistering}>
                  {googleRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </Form>

            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setMode("choose")}>
              ← Use a different account
            </Button>
          </>
        )}

      </CardContent>

      <CardFooter className="text-center text-sm">
        <div className="w-full text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
