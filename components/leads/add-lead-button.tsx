"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export function AddLeadButton() {
  return (
    <Link href="/leads/new">
      <Button
        size="lg"
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all"
      >
        <Plus className="mr-2 h-5 w-5" />
        Create Lead
      </Button>
    </Link>
  )
}
