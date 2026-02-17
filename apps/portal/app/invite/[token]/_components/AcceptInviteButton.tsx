"use client"

import { signIn } from "next-auth/react"
import { Button } from "@repo/ui/button"

export function AcceptInviteButton({ token }: { token: string }) {
  return (
    <Button
      className="w-full"
      size="lg"
      onClick={() =>
        signIn("google", { callbackUrl: `/invite/${token}/accept` })
      }
    >
      Accept Invitation
    </Button>
  )
}
