"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PermissionTree } from "./permission-tree"
import { PermissionsStructure } from "@/lib/permissions"
import { toast } from "sonner"

interface Role {
  id: number
  name: string
  slug: string
  description?: string | null
  permissions: PermissionsStructure
  is_system: boolean
  status: "active" | "inactive"
}

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  onSuccess: () => void
}

const defaultPermissions: PermissionsStructure = {
  menus: {
    dashboard: false,
    leads: false,
    investors: false,
    tasks: false,
    activities: false,
    reports: false,
    settings: {
      leadFields: false,
      investorFields: false,
      activityTypes: false,
      users: false,
      roles: false,
    },
  },
  dataAccess: {
    leads: "assigned",
    investors: "assigned",
    activities: "assigned",
  },
}

export function RoleFormDialog({ open, onOpenChange, role, onSuccess }: RoleFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    permissions: defaultPermissions,
    status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        slug: role.slug,
        description: role.description || "",
        permissions: role.permissions,
        status: role.status,
      })
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        permissions: defaultPermissions,
        status: "active",
      })
    }
  }, [role, open])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: role ? prev.slug : generateSlug(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = role ? `/api/settings/roles/${role.id}` : "/api/settings/roles"
      const method = role ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save role")
      }

      toast.success(role ? "Role updated successfully" : "Role created successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to save role")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
          <DialogDescription>
            {role ? "Update role details and permissions" : "Define a new role with specific permissions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Sales Manager"
                  required
                  disabled={role?.is_system}
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.name.length}/255 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., sales-manager"
                  required
                  disabled={!!role}
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.slug.length}/255 characters
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this role..."
                rows={2}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Permissions */}
          <PermissionTree
            permissions={formData.permissions}
            onChange={(permissions) => setFormData({ ...formData, permissions })}
            disabled={role?.is_system}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || role?.is_system}>
              {loading ? "Saving..." : role ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
