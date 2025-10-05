"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadReportsTab } from "./lead-reports-tab"
import { InvestorReportsTab } from "./investor-reports-tab"
import { ActivityReportsTab } from "./activity-reports-tab"
import { FileText, Users, Building2, Activity } from "lucide-react"

export function ReportsClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive reports and insights for Leads, Investors, and Activities
        </p>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lead Reports
          </TabsTrigger>
          <TabsTrigger value="investors" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Investor Reports
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-6">
          <LeadReportsTab />
        </TabsContent>

        <TabsContent value="investors" className="mt-6">
          <InvestorReportsTab />
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <ActivityReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
