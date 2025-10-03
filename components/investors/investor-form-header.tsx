"use client"

import { ArrowLeft, Save, X, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface InvestorFormHeaderProps {
  isEditing: boolean
  investorName?: string
  isSubmitting: boolean
  onSave: () => void
  onCancel: () => void
  isSaved?: boolean
}

export function InvestorFormHeader({
  isEditing,
  investorName,
  isSubmitting,
  onSave,
  onCancel,
  isSaved = false,
}: InvestorFormHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <Link href="/investors">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing ? "Edit Contact" : "Create Contact"}
              </h1>
              {isEditing && investorName && (
                <p className="text-sm text-gray-500 mt-0.5">{investorName}</p>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isSaved && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" />
                <span>Saved</span>
              </div>
            )}

            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>

            <Button
              onClick={onSave}
              disabled={isSubmitting}
              className="bg-[#FF7A59] hover:bg-[#FF6B47] text-white shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
