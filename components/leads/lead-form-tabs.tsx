"use client"

import { User, Building2, FileText, Grid3x3 } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabId = "about" | "company" | "details" | "custom"

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

interface LeadFormTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  customFieldsCount: number
}

export function LeadFormTabs({
  activeTab,
  onTabChange,
  customFieldsCount,
}: LeadFormTabsProps) {
  const tabs: Tab[] = [
    {
      id: "about",
      label: "About",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "company",
      label: "Company",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "details",
      label: "Details",
      icon: <FileText className="w-4 h-4" />,
    },
  ]

  if (customFieldsCount > 0) {
    tabs.push({
      id: "custom",
      label: "More",
      icon: <Grid3x3 className="w-4 h-4" />,
    })
  }

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  isActive
                    ? "border-[#FF7A59] text-[#FF7A59]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === "custom" && customFieldsCount > 0 && (
                  <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                    {customFieldsCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
