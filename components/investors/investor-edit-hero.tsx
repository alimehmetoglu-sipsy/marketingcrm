"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Calendar, Save, X } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface InvestorEditHeroProps {
  investor: {
    id: number
    full_name: string
    email: string
    phone: string | null
    source: string
    status: string
    priority: string
    created_at: Date | null
  }
  isSubmitting: boolean
  onSave: () => void
  onCancel: () => void
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "text-green-700", bg: "bg-green-50 border-green-200", label: "Active" },
  prospect: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Prospect" },
  interested: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Interested" },
  negotiating: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Negotiating" },
  invested: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Invested" },
  inactive: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Inactive" },
}

const priorityConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  low: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Low", icon: "○" },
  medium: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Medium", icon: "◐" },
  high: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "High", icon: "●" },
  urgent: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Urgent", icon: "⚠" },
}

export function InvestorEditHero({ investor, isSubmitting, onSave, onCancel }: InvestorEditHeroProps) {
  const status = statusConfig[investor.status] || statusConfig.active
  const priority = investor.priority ? (priorityConfig[investor.priority] || priorityConfig.medium) : null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 p-8 shadow-xl mb-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />

      <div className="relative">
        {/* Back Button & Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/investors">
            <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white border border-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="bg-white/95 hover:bg-white text-gray-900 shadow-lg"
              onClick={onSave}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="secondary"
              className="bg-red-500/90 hover:bg-red-600 text-white shadow-lg"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Investor Info */}
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
            <AvatarFallback className="text-2xl font-bold bg-white/90 text-emerald-600">
              {getInitials(investor.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                {investor.full_name}
              </h1>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-sm">
                Editing
              </Badge>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${status.bg} ${status.color} border-none shadow-sm`}>
                {status.label}
              </Badge>
              {priority && (
                <Badge className={`${priority.bg} ${priority.color} border-none shadow-sm`}>
                  <span className="mr-1">{priority.icon}</span>
                  {priority.label}
                </Badge>
              )}
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                {investor.source.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <a href={`mailto:${investor.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{investor.email}</span>
              </a>
              {investor.phone && (
                <>
                  <span className="text-white/40">•</span>
                  <a href={`tel:${investor.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{investor.phone}</span>
                  </a>
                </>
              )}
              <span className="text-white/40">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Created {investor.created_at ? format(new Date(investor.created_at), "MMM dd, yyyy") : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
