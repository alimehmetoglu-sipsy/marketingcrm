"use client"

import { cn } from "@/lib/utils"

interface LeadFormProgressProps {
  completedFields: number
  totalFields: number
  className?: string
}

export function LeadFormProgress({
  completedFields,
  totalFields,
  className,
}: LeadFormProgressProps) {
  const percentage = Math.round((completedFields / totalFields) * 100)
  const isComplete = percentage === 100

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Form completion</span>
        <span
          className={cn(
            "font-semibold",
            isComplete ? "text-green-600" : "text-[#FF7A59]"
          )}
        >
          {percentage}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            isComplete
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-[#FF7A59] to-[#FF9B82]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {completedFields} of {totalFields} fields completed
      </p>
    </div>
  )
}
