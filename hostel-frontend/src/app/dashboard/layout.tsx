"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  Hotel, 
  Bed, 
  CalendarDays, 
  MessageSquareWarning, 
  CreditCard, 
  Bell 
} from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";

// Static routes mapping based on roles
const navItems = {
  SUPER_ADMIN: [
    { label: "Overview", href: "/dashboard/superadmin", icon: Home },
    { label: "Hostels", href: "/dashboard/superadmin/hostels", icon: Hotel },
  ],
  ADMIN: [
    { label: "Overview", href: "/dashboard/admin", icon: Home },
    { label: "Rooms & Beds", href: "/dashboard/admin/rooms", icon: Bed },
    { label: "Residents", href: "/dashboard/admin/users", icon: Users },
    { label: "Food Menu", href: "/dashboard/admin/food", icon: CalendarDays },
    { label: "Complaints", href: "/dashboard/admin/complaints", icon: MessageSquareWarning },
    { label: "Payments", href: "/dashboard/admin/payments", icon: CreditCard },
  ],
  USER: [
    { label: "Overview", href: "/dashboard/user", icon: Home },
    { label: "My Room", href: "/dashboard/user/room", icon: Bed },
    { label: "Food Menu", href: "/dashboard/user/food", icon: CalendarDays },
    { label: "My Complaints", href: "/dashboard/user/complaints", icon: MessageSquareWarning },
    { label: "My Dues", href: "/dashboard/user/payments", icon: CreditCard },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isMounted || !isAuthenticated || !user) {
    return null; // Return nothing or skeleton during initial auth check
  }

  const links = navItems[user.role] || [];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    logout();
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <span className="text-xl tracking-tight">HostelFlow<span className="text-indigo-500">.</span></span>
          </Link>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <nav className="grid items-start px-2 py-4 space-y-1 lg:px-4 text-sm font-medium">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== `/dashboard/${user.role.toLowerCase()}`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t w-full flex items-center justify-between text-muted-foreground">
             <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-xs space-y-0">
                   <p className="font-semibold text-foreground truncate w-24">{user.name}</p>
                   <p className="opacity-70">{user.role}</p>
                </div>
             </div>
             <button onClick={handleLogout} className="p-2 hover:bg-muted rounded-md transition-colors text-red-500">
               <LogOut className="h-4 w-4" />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex flex-col md:pl-64 w-full">
        <header className="sticky top-0 z-30 flex h-14 w-full items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 justify-end shadow-sm">
           {/* Mobile menu could go here, omitting for brevity mostly desktop focus per prompt's "production-level dashboard" flavor */}
           <div className="flex gap-4 items-center">
             <Link href="/dashboard/notifications">
               <Button variant="ghost" size="icon" className="relative">
                 <Bell className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
               </Button>
             </Link>
             <ThemeToggle />
             {/* Simple user dropdown */}
             <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuLabel>My Account</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem>Settings</DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-600 focus:text-red-600">
                   Logout
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
