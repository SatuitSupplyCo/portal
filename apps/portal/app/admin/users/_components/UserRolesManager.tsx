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
import { X, Plus } from "lucide-react"
import { assignRoleToUser, removeRoleFromUser } from "../../roles/actions"

interface RoleOption {
  id: string
  name: string
  isSystem: boolean
}

interface AssignedRole {
  roleId: string
  roleName: string
  isSystem: boolean
}

interface UserRolesManagerProps {
  userId: string
  assignedRoles: AssignedRole[]
  allRoles: RoleOption[]
  isSelf: boolean
}

export function UserRolesManager({
  userId,
  assignedRoles,
  allRoles,
  isSelf,
}: UserRolesManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")

  const assignedIds = new Set(assignedRoles.map((r) => r.roleId))
  const availableRoles = allRoles.filter((r) => !assignedIds.has(r.id))

  function handleAssign() {
    if (!selectedRoleId) return
    setError(null)
    startTransition(async () => {
      try {
        await assignRoleToUser(userId, selectedRoleId)
        setSelectedRoleId("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to assign role")
      }
    })
  }

  function handleRemove(roleId: string) {
    setError(null)
    startTransition(async () => {
      try {
        await removeRoleFromUser(userId, roleId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove role")
      }
    })
  }

  return (
    <div className="space-y-3">
      {/* Current roles */}
      {assignedRoles.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {assignedRoles.map((role) => (
            <Badge
              key={role.roleId}
              variant={role.isSystem ? "default" : "secondary"}
              className="gap-1.5 pr-1"
            >
              {role.roleName}
              {!isSelf && (
                <button
                  type="button"
                  onClick={() => handleRemove(role.roleId)}
                  disabled={isPending}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No roles assigned</p>
      )}

      {/* Add role */}
      {!isSelf && availableRoles.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Add a role..." />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAssign}
            disabled={isPending || !selectedRoleId}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
      )}

      {isSelf && (
        <p className="text-xs text-muted-foreground">
          You cannot change your own roles
        </p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
