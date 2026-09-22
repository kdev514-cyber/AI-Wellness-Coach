"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  ChartNoAxesCombined,
  Dumbbell,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Salad,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Nutrition", href: "/nutrition", icon: Salad },
  { name: "Workout", href: "/workout", icon: Dumbbell },
  { name: "Daily Tracker", href: "/tracker", icon: ListChecks },
  { name: "Progress", href: "/progress", icon: ChartNoAxesCombined },
  { name: "Ask Nalamera", href: "/coach", icon: Bot },
  { name: "Profile", href: "/profile", icon: UserRound },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    setMobileMenuOpen(false);
    router.replace("/login");
  }

  function NavigationContent() {
    return (
      <>
        <div className="mb-7">
          <Link href="/dashboard" className="block">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#07875f] text-white shadow-sm">
                <HeartPulse size={23} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-950">Daily Ally</h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  Wellness, every day
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mb-5 rounded-2xl bg-[#eaf6ef] p-4">
          <div className="flex items-center gap-2 text-[#07875f]">
            <Sparkles size={16} />
            <p className="text-xs font-bold uppercase tracking-[0.12em]">
              Your Daily Ally
            </p>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Plans, tracking and guidance working together around your routine.
          </p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-[#07875f] font-semibold text-white shadow-sm"
                    : "font-medium text-slate-600 hover:bg-[#eef6f1] hover:text-[#066f4f]"
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.1 : 1.8} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-slate-200 pt-5">
          {pathname !== "/dashboard" && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 transition hover:bg-[#eef6f1] hover:text-[#066f4f]"
            >
              <ArrowLeft size={19} strokeWidth={1.8} />
              <span>Back to Dashboard</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={19} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-emerald-100 bg-white p-5 lg:flex">
        <div className="sticky top-0 flex h-screen flex-col py-1">
          <NavigationContent />
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-emerald-100 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#07875f] text-white">
            <HeartPulse size={19} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-950">Daily Ally</p>
            <p className="truncate text-[10px] font-medium text-[#07875f]">
              Wellness, every day
            </p>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 transition hover:bg-[#eef6f1]"
        >
          <Menu size={21} strokeWidth={1.9} />
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-slate-950/40 backdrop-blur-[1px]"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[86%] max-w-[320px] flex-col overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-[#eef6f1]"
              >
                <X size={21} strokeWidth={1.9} />
              </button>
            </div>

            <NavigationContent />
          </aside>
        </div>
      )}
    </>
  );
}
