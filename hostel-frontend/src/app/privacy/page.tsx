import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Bell } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: April 8, 2026</p>
          </div>

          {/* Quick Overview */}
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Your Privacy Matters
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              At LuminaStay, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information. We never sell your data to third parties.
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-indigo-600" />
                1. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you register for LuminaStay, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Name and email address</li>
                <li>Phone number</li>
                <li>Hostel and room information</li>
                <li>Payment information (processed securely by Razorpay)</li>
                <li>Profile details (optional family information)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Usage Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We automatically collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Device information (browser, OS, device type)</li>
                <li>IP address and location data</li>
                <li>Usage patterns and feature interactions</li>
                <li>Log data and error reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-indigo-600" />
                2. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide and maintain the Service</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send important notifications and updates</li>
                <li>Respond to your requests and support inquiries</li>
                <li>Improve and optimize the Service</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-indigo-600" />
                3. Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement industry-standard security measures:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Encryption in transit (HTTPS/TLS)</li>
                <li>Encryption at rest for sensitive data</li>
                <li>Secure password hashing (bcrypt)</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure payment processing via Razorpay</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your data with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Service Providers:</strong> Razorpay for payment processing, email services for notifications</li>
                <li><strong>Hostel Administrators:</strong> Your hostel admin can view your profile and payment information</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-indigo-600" />
                5. Your Rights
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Object:</strong> Object to certain data processing activities</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:tanishjain2004@gmail.com" className="text-indigo-600 hover:underline">tanishjain2004@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns</li>
                <li>Improve user experience</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can control cookies through your browser settings. Disabling cookies may affect Service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal, tax, or regulatory purposes for up to 7 years.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                LuminaStay is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-6 w-6 text-indigo-600" />
                11. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <p className="font-medium">LuminaStay Privacy Team</p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> <a href="mailto:tanishjain2004@gmail.com" className="text-indigo-600 hover:underline">tanishjain2004@gmail.com</a>
                </p>
                <p className="text-muted-foreground">
                  <strong>Response Time:</strong> We aim to respond within 48 hours
                </p>
                <p className="text-muted-foreground">
                  <strong>Website:</strong> <a href="https://hostelflow.com" className="text-indigo-600 hover:underline">hostelflow.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 LuminaStay Systems Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
