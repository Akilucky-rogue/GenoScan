"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, History, Settings, HelpCircle, FileText, Database } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export function DashboardNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Analysis History",
      href: "/dashboard/history",
      icon: <History className="h-4 w-4" />,
    },
    {
      title: "Saved Reports",
      href: "/dashboard/reports",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Reference Database",
      href: "/dashboard/database",
      icon: <Database className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: "Help & Support",
      href: "/dashboard/help",
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ]

  return (
    <nav className="grid gap-1">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn("w-full justify-start", pathname === item.href ? "bg-muted hover:bg-muted" : "")}
          >
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Button>
        </Link>
      ))}
    </nav>
  )
}
