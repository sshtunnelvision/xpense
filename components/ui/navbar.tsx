"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Receipts",
    href: "/dashboard/receipts",
    icon: Receipt,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
];

export function Navbar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="flex flex-col h-full bg-gray-900 text-white w-64 p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <h1 className="text-xl font-bold">Xpense</h1>
      </div>

      <div className="flex-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <Button
        variant="ghost"
        className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 w-full justify-start px-3"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </Button>
    </nav>
  );
}
