"use client"

import { useTransition, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { updateUserRole } from "../actions"

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "internal_viewer", label: "Internal Viewer" },
  { value: "partner_viewer", label: "Partner Viewer" },
  { value: "vendor_viewer", label: "Vendor Viewer" },
]

interface UserRoleSelectProps {
  userId: string
  currentRole: string
  currentUserRole: string
  currentUserId: string
}

export function UserRoleSelect({
  userId,
  currentRole,
  currentUserRole,
  currentUserId,
}: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isSelf = userId === currentUserId
  const isOwnerOnly = currentUserRole !== "owner"

  function handleChange(newRole: string) {
    setError(null)
    startTransition(async () => {
      try {
        await updateUserRole(
          userId,
          newRole as Parameters<typeof updateUserRole>[1],
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update role")
      }
    })
  }

  return (
    <div className="space-y-1">
      <Select
        value={currentRole}
        onValueChange={handleChange}
        disabled={isPending || isSelf}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem
              key={role.value}
              value={role.value}
              disabled={role.value === "owner" && isOwnerOnly}
            >
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isSelf && (
        <p className="text-xs text-muted-foreground">
          You cannot change your own role
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
