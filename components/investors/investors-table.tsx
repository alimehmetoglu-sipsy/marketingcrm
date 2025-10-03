"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, Mail, Phone, Search, TrendingUp, Users, DollarSign, MoreHorizontal, Eye, Edit, Trash, Calendar } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { DeleteInvestorDialog } from "./delete-investor-dialog"

interface Investor {
  id: number
  full_name: string
  email: string
  phone: string | null
  company: string | null
  position: string | null
  status: string
  priority: string | null
  source: string
  created_at: Date | null
}

interface InvestorsTableProps {
  investors: Investor[]
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  potential: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Potential" },
  active: { color: "text-green-700", bg: "bg-green-50 border-green-200", label: "Active" },
  inactive: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Inactive" },
  interested: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", label: "Interested" },
  committed: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Committed" },
}

const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
  low: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", label: "Low" },
  normal: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Normal" },
  medium: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Medium" },
  high: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "High" },
  urgent: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Urgent" },
}

const SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "social_media", label: "Social Media" },
  { value: "referral", label: "Referral" },
  { value: "cold_call", label: "Cold Call" },
  { value: "email", label: "Email" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
]

export function InvestorsTable({ investors }: InvestorsTableProps) {
  const router = useRouter()
  const [deleteInvestor, setDeleteInvestor] = useState<{ id: string; name: string } | null>(null)

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: investors.length,
      active: investors.filter(i => i.status === "active").length,
      potential: investors.filter(i => i.status === "potential").length,
      committed: investors.filter(i => i.status === "committed").length,
    }
  }, [investors])


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.total}</div>
              <Users className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-600">{stats.potential}</div>
              <Building2 className="h-8 w-8 text-blue-500 opacity-40" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Committed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-emerald-600">{stats.committed}</div>
              <DollarSign className="h-8 w-8 text-emerald-500 opacity-40" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold">Investor Name</TableHead>
                <TableHead className="font-semibold">Contact Info</TableHead>
                <TableHead className="font-semibold">Source</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Priority</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">No investors found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                investors.map((investor) => {
                const status = statusConfig[investor.status] || statusConfig.potential
                const priority = investor.priority ? priorityConfig[investor.priority] : null

                return (
                  <TableRow
                    key={investor.id}
                    className="cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => router.push(`/investors/${investor.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white font-semibold">
                          {investor.full_name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {investor.full_name}
                          </div>
                          {investor.position && (
                            <div className="text-xs text-muted-foreground">{investor.position}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {investor.email}
                        </div>
                        {investor.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {investor.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700 capitalize">
                        {investor.source.replace(/_/g, " ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status.bg} ${status.color} border-2`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {priority ? (
                        <Badge variant="outline" className={`${priority.bg} ${priority.color} border-2`}>
                          {priority.label}
                        </Badge>
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-xs font-medium text-gray-500">
                          <span>—</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{investor.created_at ? formatDistanceToNow(new Date(investor.created_at), { addSuffix: true }) : "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs font-semibold text-gray-700">Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/investors/${investor.id}`} className="flex items-center cursor-pointer">
                              <Eye className="mr-2 h-4 w-4 text-gray-600" />
                              <span>View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/investors/${investor.id}/edit`} className="flex items-center cursor-pointer">
                              <Edit className="mr-2 h-4 w-4 text-gray-600" />
                              <span>Edit Investor</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteInvestor({
                                id: String(investor.id),
                                name: investor.full_name
                              })
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete Investor</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteInvestorDialog
        open={!!deleteInvestor}
        onOpenChange={(open) => !open && setDeleteInvestor(null)}
        investorId={deleteInvestor?.id || ""}
        investorName={deleteInvestor?.name || ""}
      />
    </div>
  )
}
