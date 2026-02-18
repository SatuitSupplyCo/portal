"use client"

import { useState, useTransition } from "react"
import { Badge } from "@repo/ui/badge"
import { Button } from "@repo/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { X, Plus, Lock } from "lucide-react"
import { createResourceGrant, deleteResourceGrant } from "./actions"

interface Grant {
  id: string
  resourceType: string
  resourceId: string
  permission: string
}

interface ResourceOption {
  id: string
  label: string
}

interface ResourceGrantsManagerProps {
  subjectType: "user" | "org"
  subjectId: string
  grants: Grant[]
  resourceTypes: {
    type: string
    label: string
    options: ResourceOption[]
  }[]
}

const PERMISSION_OPTIONS = [
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "admin", label: "Admin" },
]

export function ResourceGrantsManager({
  subjectType,
  subjectId,
  grants,
  resourceTypes,
}: ResourceGrantsManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedResource, setSelectedResource] = useState<string>("")
  const [selectedPermission, setSelectedPermission] = useState<string>("read")

  const currentResType = resourceTypes.find((rt) => rt.type === selectedType)

  function handleAdd() {
    if (!selectedType || !selectedResource || !selectedPermission) return
    setError(null)
    startTransition(async () => {
      try {
        await createResourceGrant({
          subjectType,
          subjectId,
          resourceType: selectedType,
          resourceId: selectedResource,
          permission: selectedPermission,
        })
        setSelectedResource("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add grant")
      }
    })
  }

  function handleRemove(grantId: string) {
    setError(null)
    startTransition(async () => {
      try {
        await deleteResourceGrant(grantId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove grant")
      }
    })
  }

  function getResourceLabel(type: string, id: string): string {
    const rt = resourceTypes.find((r) => r.type === type)
    const opt = rt?.options.find((o) => o.id === id)
    return opt?.label ?? id
  }

  const groupedGrants = grants.reduce(
    (acc, grant) => {
      if (!acc[grant.resourceType]) acc[grant.resourceType] = []
      acc[grant.resourceType].push(grant)
      return acc
    },
    {} as Record<string, Grant[]>,
  )

  return (
    <div className="space-y-4">
      {Object.keys(groupedGrants).length > 0 ? (
        Object.entries(groupedGrants).map(([type, typeGrants]) => {
          const rtLabel =
            resourceTypes.find((r) => r.type === type)?.label ?? type
          return (
            <div key={type} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {rtLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {typeGrants.map((grant) => (
                  <Badge
                    key={grant.id}
                    variant="secondary"
                    className="gap-1.5 pr-1"
                  >
                    <Lock className="h-3 w-3" />
                    {getResourceLabel(type, grant.resourceId)}
                    <span className="text-xs text-muted-foreground">
                      ({grant.permission})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(grant.id)}
                      disabled={isPending}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )
        })
      ) : (
        <p className="text-sm text-muted-foreground">
          No resource-level access grants. This {subjectType} relies on role
          permissions only.
        </p>
      )}

      {/* Add grant form */}
      <div className="flex flex-wrap items-end gap-2 pt-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Resource Type</label>
          <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setSelectedResource("") }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type..." />
            </SelectTrigger>
            <SelectContent>
              {resourceTypes.map((rt) => (
                <SelectItem key={rt.type} value={rt.type}>
                  {rt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentResType && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Resource</label>
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {currentResType.options.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Permission</label>
          <Select value={selectedPermission} onValueChange={setSelectedPermission}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERMISSION_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={isPending || !selectedType || !selectedResource}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
