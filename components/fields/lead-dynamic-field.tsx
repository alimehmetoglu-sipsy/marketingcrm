"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

type LeadCustomField = {
  id: number
  name: string
  label: string
  type: string
  is_required: boolean
  placeholder: string | null
  help_text: string | null
  default_value: string | null
  lead_field_options?: Array<{
    id: number
    value: string
    label: string
  }>
}

interface LeadDynamicFieldProps {
  field: LeadCustomField
  value: any
  onChange: (value: any) => void
}

export function LeadDynamicField({ field, value, onChange }: LeadDynamicFieldProps) {
  const [open, setOpen] = useState(false)

  // Get field options for lead fields
  const fieldOptions = field.lead_field_options || []

  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "url":
        return (
          <Input
            type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.is_required}
          />
        )

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.is_required}
            rows={3}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.is_required}
          />
        )

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.is_required}
          />
        )

      case "select":
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {fieldOptions.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "multiselect":
        return (
          <div className="space-y-2">
            {fieldOptions.map((option) => {
              const isChecked = Array.isArray(value)
                ? value.includes(option.value)
                : false

              return (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : []
                      if (checked) {
                        onChange([...currentValues, option.value])
                      } else {
                        onChange(
                          currentValues.filter((v: string) => v !== option.value)
                        )
                      }
                    }}
                  />
                  <label
                    htmlFor={`${field.id}-${option.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              )
            })}
          </div>
        )

      case "multiselect_dropdown":
        const selectedValues = Array.isArray(value) ? value : []
        const selectedLabels = selectedValues
          .map((val) => {
            const option = fieldOptions.find((opt) => opt.value === val)
            return option?.label
          })
          .filter(Boolean)

        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-auto min-h-[40px]"
              >
                <div className="flex flex-wrap gap-1">
                  {selectedLabels.length > 0 ? (
                    selectedLabels.map((label, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="mr-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          const valueToRemove = selectedValues[index]
                          onChange(selectedValues.filter((v) => v !== valueToRemove))
                        }}
                      >
                        {label}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">
                      {field.placeholder || "Select options..."}
                    </span>
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="max-h-64 overflow-auto p-1">
                {fieldOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
                        isSelected && "bg-accent"
                      )}
                      onClick={() => {
                        if (isSelected) {
                          onChange(selectedValues.filter((v) => v !== option.value))
                        } else {
                          onChange([...selectedValues, option.value])
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      {option.label}
                    </div>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`field-${field.id}`}
              checked={value === "true" || value === true}
              onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
            />
            <label
              htmlFor={`field-${field.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.help_text || "Check to enable"}
            </label>
          </div>
        )

      default:
        return (
          <Input
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.is_required}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${field.id}`}>
        {field.label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {field.help_text && field.type !== "checkbox" && (
        <p className="text-xs text-gray-500">{field.help_text}</p>
      )}
    </div>
  )
}
