"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export function AddInvestorButton() {
  return (
    <Link href="/investors/new">
      <Button
        size="lg"
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm hover:shadow-md transition-all"
      >
        <Plus className="mr-2 h-5 w-5" />
        Create Investor
      </Button>
    </Link>
  )
}
