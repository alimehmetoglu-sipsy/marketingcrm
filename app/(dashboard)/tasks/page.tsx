import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

async function getTasks() {
  const [pending, inProgress, completed] = await Promise.all([
    prisma.tasks.findMany({
      where: { status: "pending" },
      orderBy: { created_at: "desc" },
      take: 20,
    }),
    prisma.tasks.findMany({
      where: { status: "in_progress" },
      orderBy: { created_at: "desc" },
      take: 20,
    }),
    prisma.tasks.findMany({
      where: { status: "completed" },
      orderBy: { created_at: "desc" },
      take: 20,
    }),
  ])

  return { pending, inProgress, completed }
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  in_progress: "bg-blue-500",
  review: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-500",
}

export default async function TasksPage() {
  const tasks = await getTasks()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your tasks
          </p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending ({tasks.pending.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.pending.map((task) => (
              <div
                key={task.id.toString()}
                className="rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {task.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge className={statusColors[task.status]}>{task.status}</Badge>
                  <Badge variant="outline">{task.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">In Progress ({tasks.inProgress.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.inProgress.map((task) => (
              <div
                key={task.id.toString()}
                className="rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {task.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge className={statusColors[task.status]}>{task.status}</Badge>
                  <Badge variant="outline">{task.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed ({tasks.completed.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.completed.map((task) => (
              <div
                key={task.id.toString()}
                className="rounded-lg border p-3 hover:bg-accent transition-colors opacity-75"
              >
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {task.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge className={statusColors[task.status]}>{task.status}</Badge>
                  <Badge variant="outline">{task.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
