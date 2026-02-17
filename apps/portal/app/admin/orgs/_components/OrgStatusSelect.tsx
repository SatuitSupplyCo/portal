"use client"

import { useTransition, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { updateOrgStatus } from "../actions"

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "archived", label: "Archived" },
]

export function OrgStatusSelect({
  orgId,
  currentStatus,
}: {
  orgId: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleChange(newStatus: string) {
    setError(null)
    startTransition(async () => {
      try {
        await updateOrgStatus(
          orgId,
          newStatus as "active" | "suspended" | "archived",
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update status")
      }
    })
  }

  return (
    <div className="space-y-1">
      <Select
        value={currentStatus}
        onValueChange={handleChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
