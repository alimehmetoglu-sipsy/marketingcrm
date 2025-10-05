"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ChartWrapperProps {
  title: string
  description?: string
  children: React.ReactNode
  isLoading?: boolean
  error?: string | null
  className?: string
  isEmpty?: boolean
  emptyMessage?: string
}

export function ChartWrapper({
  title,
  description,
  children,
  isLoading = false,
  error = null,
  className,
  isEmpty = false,
  emptyMessage = "No data available",
}: ChartWrapperProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[200px] w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isEmpty ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="mx-auto h-10 w-10 mb-2 opacity-50" />
              <p>{emptyMessage}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
