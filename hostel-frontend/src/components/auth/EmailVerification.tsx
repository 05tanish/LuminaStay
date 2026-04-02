"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailVerificationProps {
  onVerified: (email: string) => void;
}

export function EmailVerification({ onVerified }: EmailVerificationProps) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const { mutate: sendOtp, isPending: isSending } = useMutation({
    mutationFn: async (emailAddr: string) => {
      const response = await api.post("/auth/otp/send", { email: emailAddr });
      return response.data;
    },
    onSuccess: () => {
      toast.success("OTP Sent!", { description: "Please check your email inbox/spam folder." });
      setStep("otp");
      startCooldown();
    },
    onError: (error: any) => {
      toast.error("Failed to send OTP", {
        description: error.response?.data?.message || "Verify the email and try again.",
      });
    },
  });

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await api.post("/auth/otp/verify", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Email verified successfully!");
      onVerified(email);
    },
    onError: (error: any) => {
      toast.error("Verification failed", {
        description: error.response?.data?.message || "Invalid or expired OTP.",
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

  const handleSendOtp = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Invalid Email", { description: "Please enter a valid email address." });
      return;
    }
    sendOtp(email);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Invalid OTP", { description: "OTP must be 6 digits." });
      return;
    }
    verifyOtp({ email, code: otp });
  };

  if (step === "email") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div className="space-y-2 text-left">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="jane@example.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isSending || !email}>
          {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send OTP
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Enter 6-digit OTP sent to <span className="font-semibold text-indigo-600">{email}</span>
        </label>
        <Input
          type="text"
          placeholder="123456"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={isVerifying}
          className="tracking-widest text-center text-lg mt-2"
          required
        />
        <div className="flex justify-between items-center mt-2 px-1">
          <button
            type="button"
            className="text-sm text-indigo-500 hover:text-indigo-600 disabled:text-muted-foreground transition-colors"
            disabled={cooldown > 0 || isSending}
            onClick={() => handleSendOtp()}
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
          </button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => {
              setStep("email");
              setOtp("");
            }}
          >
            Change Email
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isVerifying || otp.length !== 6}>
        {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
        Verify & Continue
      </Button>
    </form>
  );
}
