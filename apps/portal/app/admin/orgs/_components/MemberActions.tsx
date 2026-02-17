"use client"

import { useTransition, useState } from "react"
import { Button } from "@repo/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { Trash2 } from "lucide-react"
import { removeOrgMember, updateMemberRole } from "../actions"

interface MemberActionsProps {
  membershipId: string
  orgId: string
  currentRole: string
}

export function MemberActions({
  membershipId,
  orgId,
  currentRole,
}: MemberActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleRoleChange(newRole: string) {
    setError(null)
    startTransition(async () => {
      try {
        await updateMemberRole(
          membershipId,
          newRole as "org_admin" | "member",
          orgId,
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed")
      }
    })
  }

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      try {
        await removeOrgMember(membershipId, orgId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed")
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentRole}
        onValueChange={handleRoleChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="org_admin">Org Admin</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={isPending}
        title="Remove member"
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
