"use client";

import Link from "next/link";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "🏠" },
  { name: "Nutrition", href: "/nutrition", icon: "🥗" },
  { name: "Workout", href: "/workout", icon: "🏋️" },
  { name: "Daily Tracker", href: "/tracker", icon: "✅" },
  { name: "Progress", href: "/progress", icon: "📈" },
  { name: "AI Coach", href: "/coach", icon: "🤖" },
  { name: "Profile", href: "/profile", icon: "👤" },
];

export default function AppSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-6">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-black">
          AI Wellness Coach
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Personal wellness
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-black"
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}