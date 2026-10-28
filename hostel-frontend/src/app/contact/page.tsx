"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to your backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-primary flex items-center gap-1 sm:gap-2">
            LuminaStay<span className="text-indigo-500 text-2xl sm:text-3xl leading-none">.</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Have questions about LuminaStay? We're here to help. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5 text-indigo-600" />
                    Email Support
                  </CardTitle>
                  <CardDescription>
                    Get help via email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href="mailto:tanishjain2004@gmail.com" 
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    tanishjain2004@gmail.com
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    Response time: Within 24-48 hours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                    Live Chat
                  </CardTitle>
                  <CardDescription>
                    Chat with our team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Available Monday - Friday, 9 AM - 6 PM IST
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Link */}
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Looking for quick answers?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Check out our documentation and common questions.
              </p>
              <Link href="/docs">
                <Button variant="outline" size="sm">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you shortly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">
                      Thank you for contacting us. We'll respond within 24-48 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What is this regarding?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Message
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting this form, you agree to our{" "}
                      <Link href="/privacy" className="text-indigo-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 LuminaStay Systems Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
