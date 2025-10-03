"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Search,
  GripVertical,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react"
import { FieldFormDialog } from "@/components/settings/field-form-dialog"
import { DeleteFieldDialog } from "@/components/settings/delete-field-dialog"
import { useRouter } from "next/navigation"
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

type InvestorField = {
  id: number
  name: string
  label: string
  type: string
  is_required: boolean
  is_active: boolean
  is_system_field: boolean
  sort_order: number
  placeholder: string | null
  help_text: string | null
  default_value: string | null
  investor_field_options?: Array<{
    id: number
    value: string
    label: string
  }>
}


function SortableFieldCard({ field, onEdit, onDelete, onToggle }: any) {
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

  const typeColors: Record<string, string> = {
    text: "bg-blue-100 text-blue-800",
    email: "bg-purple-100 text-purple-800",
    phone: "bg-green-100 text-green-800",
    url: "bg-cyan-100 text-cyan-800",
    textarea: "bg-indigo-100 text-indigo-800",
    number: "bg-orange-100 text-orange-800",
    date: "bg-pink-100 text-pink-800",
    select: "bg-emerald-100 text-emerald-800",
    multiselect: "bg-teal-100 text-teal-800",
    multiselect_dropdown: "bg-violet-100 text-violet-800",
    checkbox: "bg-amber-100 text-amber-800",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* Field Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900">{field.label}</h3>
            <Badge
              variant="secondary"
              className={`${typeColors[field.type] || "bg-gray-100 text-gray-800"} text-xs`}
            >
              {field.type}
            </Badge>
            {field.is_required && (
              <Badge variant="outline" className="text-xs">
                Required
              </Badge>
            )}
            {field.is_system_field && (
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                <AlertCircle className="w-3 h-3 mr-1" />
                System
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-2">Field name: {field.name}</p>

          {field.help_text && (
            <p className="text-xs text-gray-400 mb-2">{field.help_text}</p>
          )}

          {field.investor_field_options && field.investor_field_options.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {field.investor_field_options.slice(0, 5).map((opt: any) => (
                <Badge key={opt.id} variant="outline" className="text-xs">
                  {opt.label}
                </Badge>
              ))}
              {field.investor_field_options.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{field.investor_field_options.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Switch
            checked={field.is_active}
            onCheckedChange={() => onToggle(field.id)}
          />

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(field)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="w-4 h-4" />
            </Button>

            {!field.is_system_field && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(field)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function InvestorFieldsClient({ fields: initialFields }: { fields: InvestorField[] }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [fields, setFields] = useState<InvestorField[]>(initialFields)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editField, setEditField] = useState<InvestorField | null>(null)
  const [deleteField, setDeleteField] = useState<InvestorField | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update fields when initialFields changes (after router.refresh())
  useEffect(() => {
    setFields(initialFields)
  }, [initialFields])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)

      const newFields = arrayMove(fields, oldIndex, newIndex)
      setFields(newFields)

      // Update backend
      try {
        await fetch("/api/settings/investor-fields/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldIds: newFields.map((f) => f.id) }),
        })
        router.refresh()
      } catch (error) {
        console.error("Failed to reorder fields:", error)
      }
    }
  }


  const handleToggle = async (id: number) => {
    try {
      await fetch(`/api/settings/investor-fields/${id}/toggle`, {
        method: "POST",
      })
      router.refresh()
    } catch (error) {
      console.error("Failed to toggle field:", error)
    }
  }

  const filteredFields = fields.filter(
    (field) =>
      field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: fields.length,
    active: fields.filter((f) => f.is_active).length,
    custom: fields.filter((f) => !f.is_system_field).length,
  }

  return (
    <div className="h-full flex flex-col">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Properties</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.custom}</div>
          <div className="text-sm text-gray-500">Custom Fields</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create property
        </Button>
      </div>

      {/* Fields List */}
      <div className="flex-1 overflow-y-auto">
        {!mounted ? (
          <div className="text-center py-12 text-gray-500">
            Loading properties...
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredFields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {filteredFields.map((field) => (
                    <SortableFieldCard
                      key={field.id}
                      field={field}
                      onEdit={setEditField}
                      onDelete={setDeleteField}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {filteredFields.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No properties found matching your search.
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <FieldFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        fieldType="investor"
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          router.refresh()
        }}
      />

      <FieldFormDialog
        open={!!editField}
        onOpenChange={(open) => !open && setEditField(null)}
        field={editField}
        fieldType="investor"
        onSuccess={() => {
          setEditField(null)
          router.refresh()
        }}
      />

      <DeleteFieldDialog
        open={!!deleteField}
        onOpenChange={(open) => !open && setDeleteField(null)}
        field={deleteField}
        fieldType="investor"
        onSuccess={() => {
          setDeleteField(null)
          router.refresh()
        }}
      />
    </div>
  )
}
