"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Save, Eye, GripVertical, AlertCircle, User, Briefcase } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useRouter } from "next/navigation"

type FormSection = {
  id: number
  section_key: string
  name: string
  is_visible: boolean
  is_default_open: boolean
  sort_order: number
  icon: string
  gradient: string
}

type InvestorField = {
  id: number
  name: string
  label: string
  type: string
  is_system_field: boolean
  section_key: string | null
}

interface FormViewConfiguratorProps {
  initialSections: FormSection[]
  initialFields: InvestorField[]
}

function SortableFieldItem({ field, onSectionChange, sections }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const currentSection = sections.find((s: FormSection) => s.section_key === field.section_key)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{field.label}</div>
        <div className="text-xs text-gray-500">{field.name}</div>
      </div>

      {field.is_system_field ? (
        <Badge variant="outline" className="text-xs">System</Badge>
      ) : null}

      <Select
        value={field.section_key || "unassigned"}
        onValueChange={(value) => onSectionChange(field.id, value === "unassigned" ? null : value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select section" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">
            <span className="text-gray-500">Unassigned</span>
          </SelectItem>
          {sections.map((section: FormSection) => (
            <SelectItem key={section.section_key} value={section.section_key}>
              {section.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function FormPreview({ sections, fields }: { sections: FormSection[]; fields: InvestorField[] }) {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "user":
        return <User className="w-4 h-4 text-white" />
      case "briefcase":
        return <Briefcase className="w-4 h-4 text-white" />
      case "document":
        return (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case "layout":
        return (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        )
      default:
        return <User className="w-4 h-4 text-white" />
    }
  }

  return (
    <div className="space-y-4">
      {sections
        .filter(s => s.is_visible)
        .map((section) => {
          const sectionFields = fields.filter(f => f.section_key === section.section_key)

          return (
            <Card key={section.id} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${section.gradient} flex items-center justify-center`}>
                    {getIconComponent(section.icon)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{section.name}</CardTitle>
                    <p className="text-xs text-gray-500">
                      {sectionFields.length} {sectionFields.length === 1 ? 'field' : 'fields'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sectionFields.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {sectionFields.map((field) => (
                      <div key={field.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="text-sm font-medium text-gray-700">{field.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{field.type}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">No fields assigned</div>
                )}
              </CardContent>
            </Card>
          )
        })}
    </div>
  )
}

export function InvestorFormViewConfigurator({ initialSections, initialFields }: FormViewConfiguratorProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sections, setSections] = useState<FormSection[]>(initialSections)
  const [fields, setFields] = useState<InvestorField[]>(initialFields)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleFieldSectionChange = (fieldId: number, sectionKey: string | null) => {
    setFields(prev =>
      prev.map(f =>
        f.id === fieldId ? { ...f, section_key: sectionKey } : f
      )
    )
  }

  const handleSectionVisibilityToggle = (sectionId: number) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId ? { ...s, is_visible: !s.is_visible } : s
      )
    )
  }

  const handleSectionDefaultToggle = (sectionId: number) => {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId ? { ...s, is_default_open: !s.is_default_open } : s
      )
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)

      setFields(arrayMove(fields, oldIndex, newIndex))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save sections
      await fetch("/api/settings/investor-form-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sections),
      })

      // Save field assignments
      await fetch("/api/settings/investor-fields/assign-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: fields.map(f => ({
            id: f.id,
            section_key: f.section_key,
          })),
        }),
      })

      router.refresh()
    } catch (error) {
      console.error("Failed to save configuration:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!mounted) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Panel - Field Assignment */}
      <div className="col-span-7 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Field Assignment</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Drag to reorder fields and assign them to sections
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#FF7A59] hover:bg-[#FF6B47] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {fields.map((field) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      sections={sections}
                      onSectionChange={handleFieldSectionChange}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        {/* Section Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Section Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded ${section.gradient} flex items-center justify-center`}>
                    {section.icon === "user" && <User className="w-4 h-4 text-white" />}
                    {section.icon === "briefcase" && <Briefcase className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-medium text-sm">{section.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Visible</span>
                    <Switch
                      checked={section.is_visible}
                      onCheckedChange={() => handleSectionVisibilityToggle(section.id)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Default Open</span>
                    <Switch
                      checked={section.is_default_open}
                      onCheckedChange={() => handleSectionDefaultToggle(section.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Preview */}
      <div className="col-span-5">
        <Card className="sticky top-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Form Preview
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>
          {showPreview && (
            <CardContent>
              <FormPreview sections={sections} fields={fields} />
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>This preview shows how the form will appear in lead create/edit pages</span>
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
