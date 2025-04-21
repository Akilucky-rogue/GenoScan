import type React from "react"
import Link from "next/link"
import { FlaskRoundIcon as Flask } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Flask className="h-6 w-6 text-primary" />
          <span>GenomeScan</span>
        </Link>
      </header>
      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 border-r md:h-[calc(100vh-4rem)] md:sticky md:top-16">
          <div className="p-4 h-full overflow-auto">
            <DashboardNav />
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
