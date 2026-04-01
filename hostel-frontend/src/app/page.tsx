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
  Smartphone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background items-center overflow-x-hidden">
      
      {/* ===================== Navigation ===================== */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center fixed top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          HostelFlow<span className="text-indigo-500 text-3xl leading-none">.</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex gap-4">
             <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground mt-2">Features</Link>
             <Link href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground mt-2">Benefits</Link>
          </div>
          <div className="flex items-center gap-2 ml-4 border-l pl-4">
            <Link href="/auth/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ===================== Hero Section ===================== */}
      <main className="flex-1 w-full pt-32 pb-16">
        
        {/* Header Hero */}
        <section className="w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center py-16 md:py-24 relative">
          <Badge variant="outline" className="mb-6 px-4 py-1 text-sm bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 rounded-full">
            🚀 The Next Generation SaaS for Campus Housing
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent max-w-4xl mx-auto leading-tight">
            Manage your entire hostel <br className="hidden md:block"/> with absolute precision.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Eliminate spreadsheets and manual tracking. Simplify room allocations, automate fee collections, broadcast daily food menus, and resolve complaints faster than ever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <Link href="/auth/signup">
              <Button size="lg" className="h-14 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-xl group transition-all">
                Start your 14-day Free Trial
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-xl bg-background hover:bg-muted">
                Explore Features
              </Button>
            </Link>
          </div>
        </section>

        {/* ===================== The Features Showcase ===================== */}
        <section id="features" className="w-full bg-muted/30 py-24 border-y">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Everything you need, nothing you don't.</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built exactly to specifications for Multi-property Super Admins, single building Hostel Admins, and the Students who live there.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Room & Bed Allocation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visually configure your entire building structure. Add rooms, set custom capacities, and effortlessly assign students directly to specific beds.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-6">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Automated Payments</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generate monthly dues. Accept online payments via Razorpay integration, or manually reconcile cash receipts instantly inside the dashboard.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center mb-6">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Daily Food Menus</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Stop answering "What's for dinner?". Provide a clear, real-time updated schedule of Breakfast, Lunch, and Dinner directly to your residents.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-8 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mb-6">
                  <MessageSquareWarning className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Complaint Resolution</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Students log issues right from their phones. Admins receive tickets instantly and can update status to Open, In Progress, or Resolved.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group p-8 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Role-Based Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Run a franchise? Super Admins can oversee multiple Hostels, delegating specific properties to Hostel Admins, keeping data perfectly siloed and secure.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ===================== Benefits / Trust Section ===================== */}
        <section id="benefits" className="w-full py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-zinc-950 dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
              
              <div className="flex-1 space-y-8 z-10 text-white">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                  Stop running your <br/> housing business on paper.
                </h2>
                <p className="text-zinc-400 text-lg max-w-md">
                  HostelFlow digitizes your entire operation, reducing administrative overhead by 60% and vastly improving student satisfaction.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg"><ShieldCheck className="w-5 h-5 text-indigo-400" /></div>
                    <span className="font-medium text-sm text-zinc-200">Bank-level Security</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg"><Zap className="w-5 h-5 text-indigo-400" /></div>
                    <span className="font-medium text-sm text-zinc-200">Real-time Syncing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg"><Smartphone className="w-5 h-5 text-indigo-400" /></div>
                    <span className="font-medium text-sm text-zinc-200">Mobile Responsive</span>
                  </div>
                </div>
              </div>

              {/* Decorative graphic */}
              <div className="flex-1 w-full h-[300px] md:h-auto min-h-[400px] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-white/10 rounded-3xl relative hidden md:block backdrop-blur-3xl shadow-2xl">
                <div className="absolute top-8 left-8 right-8 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-4">
                  <div className="w-3 h-3 rounded-full bg-red-400 mr-2" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="absolute top-28 left-8 right-8 bottom-8 bg-white/5 border border-white/10 rounded-xl p-6">
                   <div className="w-1/3 h-6 bg-white/10 rounded-md mb-6" />
                   <div className="w-full h-8 bg-white/5 rounded-md mb-3" />
                   <div className="w-full h-8 bg-white/5 rounded-md mb-3" />
                   <div className="w-3/4 h-8 bg-white/5 rounded-md" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ===================== Final CTA ===================== */}
        <section className="w-full py-24 text-center">
           <div className="max-w-3xl mx-auto px-6 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to modernize your hostel?</h2>
              <p className="text-xl text-muted-foreground">Join hundreds of hostel owners who manage their properties effortlessly.</p>
              <Link href="/auth/signup" className="inline-block mt-8">
                <Button size="lg" className="h-14 px-10 text-lg bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-2xl">
                  Get Started for Free
                </Button>
              </Link>
           </div>
        </section>
      </main>

      {/* ===================== Footer ===================== */}
      <footer className="w-full py-12 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
             <div className="text-xl font-bold tracking-tight text-primary mb-4">
                HostelFlow.
             </div>
             <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
               The premier operating system for student accommodations, PGs, and multi-property hostels. Simplify your daily workflow.
             </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Case Studies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© 2026 HostelFlow Systems Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="hover:text-foreground cursor-pointer">Twitter</span>
            <span className="hover:text-foreground cursor-pointer">LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
