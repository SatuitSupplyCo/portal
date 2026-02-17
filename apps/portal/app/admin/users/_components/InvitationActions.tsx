"use client"

import { useTransition, useState } from "react"
import { Button } from "@repo/ui/button"
import { RotateCcw, XCircle } from "lucide-react"
import { revokeInvitation, resendInvitation } from "../actions"

interface InvitationActionsProps {
  invitationId: string
  status: string
}

export function InvitationActions({
  invitationId,
  status,
}: InvitationActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (status !== "pending") return null

  function handleRevoke() {
    setError(null)
    startTransition(async () => {
      try {
        await revokeInvitation(invitationId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to revoke")
      }
    })
  }

  function handleResend() {
    setError(null)
    startTransition(async () => {
      try {
        await resendInvitation(invitationId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to resend")
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleResend}
        disabled={isPending}
        title="Resend invitation"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRevoke}
        disabled={isPending}
        title="Revoke invitation"
      >
        <XCircle className="h-3.5 w-3.5" />
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
