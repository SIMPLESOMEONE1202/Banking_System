"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  CreditCard, 
  Settings, 
  LogOut,
  Bell,
  Bot
} from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Accounts", href: "/dashboard/accounts", icon: Wallet },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { name: "Cards", href: "/dashboard/cards", icon: CreditCard },
  { name: "AI Copilot", href: "/dashboard/copilot", icon: Bot },
  { name: "Compliance", href: "/dashboard/compliance", icon: Shield, role: ["COMPLIANCE_OFFICER", "ADMIN"] },
  { name: "Fraud Analytics", href: "/dashboard/fraud", icon: Activity, role: ["FRAUD_ANALYST", "ADMIN"] },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-black flex flex-col fixed inset-y-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Shield className="w-6 h-6 text-white mr-3" />
          <span className="font-bold tracking-tight text-lg">Enterprise</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const userRole = (session.user as any)?.role;
            if (item.role && !item.role.includes(userRole)) return null;
            
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-zinc-900 text-white" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-semibold">
              {(session.user as any)?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{(session.user as any)?.email}</p>
              <p className="text-xs text-zinc-500 truncate">{(session.user as any)?.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-zinc-800 bg-black/80 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg capitalize">
              {pathname.split("/").pop() === "dashboard" ? "Overview" : pathname.split("/").pop()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
