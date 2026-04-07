import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Building2, 
  CreditCard, 
  MessageSquareWarning, 
  Users, 
  Utensils, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
  Menu,
  X,
  CheckCircle2,
  BarChart3,
  Bell,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background items-center overflow-x-hidden">
      
      {/* ===================== Navigation ===================== */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center fixed top-0 z-50 bg-background/95 backdrop-blur-lg border-b">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-primary flex items-center gap-1 sm:gap-2">
          HostelFlow<span className="text-indigo-500 text-2xl sm:text-3xl leading-none">.</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <div className="hidden lg:flex gap-4">
             <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
             <Link href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Benefits</Link>
          </div>
          <div className="flex items-center gap-2 ml-2 sm:ml-4 border-l pl-2 sm:pl-4">
            <Link href="/auth/login" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ===================== Hero Section ===================== */}
      <main className="flex-1 w-full pt-20 sm:pt-24 md:pt-32 pb-8 sm:pb-16">
        
        {/* Header Hero */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center py-12 sm:py-16 md:py-24 relative">
          <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 text-xs sm:text-sm bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 rounded-full">
            🚀 The Next Generation SaaS for Campus Housing
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tighter mb-4 sm:mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent max-w-4xl mx-auto leading-tight px-4">
            Manage your entire hostel with absolute precision
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
            Eliminate spreadsheets and manual tracking. Simplify room allocations, automate fee collections, broadcast daily food menus, and resolve complaints faster than ever.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full max-w-md sm:max-w-none px-4">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl group transition-all">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base rounded-xl bg-background hover:bg-muted">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </section>

        {/* ===================== The Features Showcase ===================== */}
        <section id="features" className="w-full bg-muted/30 py-12 sm:py-16 md:py-24 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-tight px-4">Everything you need, nothing you don't</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                Built exactly to specifications for Multi-property Super Admins, single building Hostel Admins, and the Students who live there.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              
              {/* Feature 1 */}
              <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center mb-4 sm:mb-6">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Room & Bed Allocation</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Visually configure your entire building structure. Add rooms, set custom capacities, and effortlessly assign students directly to specific beds.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-4 sm:mb-6">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Automated Payments</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Generate monthly dues. Accept online payments via Razorpay integration, or manually reconcile cash receipts instantly inside the dashboard.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center mb-4 sm:mb-6">
                  <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Daily Food Menus</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Stop answering "What's for dinner?". Provide a clear, real-time updated schedule of Breakfast, Lunch, and Dinner directly to your residents.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mb-4 sm:mb-6">
                  <MessageSquareWarning className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Complaint Resolution</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Students log issues right from their phones. Admins receive tickets instantly and can update status to Open, In Progress, or Resolved.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-4 sm:mb-6">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Role-Based Access</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Run a franchise? Super Admins can oversee multiple Hostels, delegating specific properties to Hostel Admins, keeping data perfectly siloed and secure.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mb-4 sm:mb-6">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Instant Notifications</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Broadcast important announcements to all residents instantly. Keep everyone informed about events, maintenance, and updates.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ===================== Benefits / Trust Section ===================== */}
        <section id="benefits" className="w-full py-12 sm:py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center gap-8 sm:gap-10 md:gap-12 overflow-hidden relative">
              
              <div className="flex-1 space-y-6 sm:space-y-8 z-10 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  Stop running your housing business on paper
                </h2>
                <p className="text-zinc-300 sm:text-zinc-400 text-base sm:text-lg max-w-md mx-auto md:mx-0">
                  HostelFlow digitizes your entire operation, reducing administrative overhead by 60% and vastly improving student satisfaction.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="p-2 bg-zinc-800 rounded-lg shrink-0"><ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" /></div>
                    <span className="font-medium text-xs sm:text-sm text-zinc-200">Bank-level Security</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="p-2 bg-zinc-800 rounded-lg shrink-0"><Zap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" /></div>
                    <span className="font-medium text-xs sm:text-sm text-zinc-200">Real-time Syncing</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="p-2 bg-zinc-800 rounded-lg shrink-0"><Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" /></div>
                    <span className="font-medium text-xs sm:text-sm text-zinc-200">Mobile Responsive</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="p-2 bg-zinc-800 rounded-lg shrink-0"><BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" /></div>
                    <span className="font-medium text-xs sm:text-sm text-zinc-200">Analytics Dashboard</span>
                  </div>
                </div>
              </div>

              {/* Decorative graphic - hidden on mobile */}
              <div className="flex-1 w-full h-[250px] sm:h-[300px] md:h-auto md:min-h-[400px] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-white/10 rounded-2xl sm:rounded-3xl relative hidden md:block backdrop-blur-3xl shadow-2xl">
                <div className="absolute top-6 sm:top-8 left-6 sm:left-8 right-6 sm:right-8 h-10 sm:h-12 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl flex items-center px-3 sm:px-4">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400 mr-1.5 sm:mr-2" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400 mr-1.5 sm:mr-2" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
                </div>
                <div className="absolute top-20 sm:top-28 left-6 sm:left-8 right-6 sm:right-8 bottom-6 sm:bottom-8 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6">
                   <div className="w-1/3 h-5 sm:h-6 bg-white/10 rounded-md mb-4 sm:mb-6" />
                   <div className="w-full h-6 sm:h-8 bg-white/5 rounded-md mb-2 sm:mb-3" />
                   <div className="w-full h-6 sm:h-8 bg-white/5 rounded-md mb-2 sm:mb-3" />
                   <div className="w-3/4 h-6 sm:h-8 bg-white/5 rounded-md" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ===================== Final CTA ===================== */}
        <section className="w-full py-12 sm:py-16 md:py-24 text-center">
           <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight px-4">Ready to modernize your hostel?</h2>
              <p className="text-lg sm:text-xl text-muted-foreground px-4">Join hundreds of hostel owners who manage their properties effortlessly.</p>
              <Link href="/auth/signup" className="inline-block mt-6 sm:mt-8">
                <Button size="lg" className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-2xl">
                  Get Started for Free
                </Button>
              </Link>
           </div>
        </section>
      </main>

      {/* ===================== Footer ===================== */}
      <footer className="w-full py-8 sm:py-12 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-1 sm:col-span-2">
             <div className="text-lg sm:text-xl font-bold tracking-tight text-primary mb-3 sm:mb-4">
                HostelFlow.
             </div>
             <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
               The premier operating system for student accommodations, PGs, and multi-property hostels. Simplify your daily workflow.
             </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm">Product</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Case Studies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm">Legal</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p className="text-center sm:text-left">© 2026 HostelFlow Systems Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
