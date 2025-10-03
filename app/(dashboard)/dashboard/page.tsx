import { auth } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"
import { DashboardStats } from "@/components/dashboard/stats"
import { RecentLeads } from "@/components/dashboard/recent-leads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function getDashboardData() {
  const [
    totalLeads,
    totalInvestors,
    totalTasks,
    pendingTasks,
    recentLeads
  ] = await Promise.all([
    prisma.leads.count(),
    prisma.investors.count(),
    prisma.tasks.count(),
    prisma.tasks.count({ where: { status: "pending" } }),
    prisma.leads.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        status: true,
        created_at: true,
      }
    })
  ])

  return {
    totalLeads,
    totalInvestors,
    totalTasks,
    pendingTasks,
    recentLeads
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      <DashboardStats
        totalLeads={data.totalLeads}
        totalInvestors={data.totalInvestors}
        totalTasks={data.totalTasks}
        pendingTasks={data.pendingTasks}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentLeads leads={data.recentLeads} />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <a href="/leads?action=create" className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <span className="text-lg">👤</span>
              </div>
              <div>
                <p className="font-medium">Add New Lead</p>
                <p className="text-sm text-muted-foreground">Create a new lead entry</p>
              </div>
            </a>

            <a href="/tasks?action=create" className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <span className="text-lg">✓</span>
              </div>
              <div>
                <p className="font-medium">Create Task</p>
                <p className="text-sm text-muted-foreground">Add a new task</p>
              </div>
            </a>

            <a href="/reports" className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <p className="font-medium">View Reports</p>
                <p className="text-sm text-muted-foreground">Analytics and insights</p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
